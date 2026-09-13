import type { FlyerForm } from "@/components/create/FlyerInfoStep";

/**
 * 작성 중인 전단 정보의 브라우저 임시 저장.
 *
 * 4단계(이름·시각·장소·특이사항·연락처)는 발행할 때 한 번에 서버로 가기 때문에,
 * 그 전에 탭이 죽으면 입력이 사라진다. 보호자가 주소를 확인하려고 앱을 오가는 사이
 * iOS 가 탭을 정리하는 상황이 실제로 흔하다.
 *
 * 서버 autosave 는 제출 이후로 미루기로 해서(팀 결정사항 ⑤) 브라우저 저장까지만 한다.
 * - 서버 API / DB 변경 없음
 * - 발행 완료 시 즉시 삭제
 * - 전단 삭제 시 즉시 삭제
 * - 연락처가 들어가므로 짧게 만료시키고, 만료분은 읽을 때 함께 지운다
 */
const PREFIX = "goldenlook:draft:";
const TTL_MS = 6 * 60 * 60 * 1000;

export type FlyerDraft = { savedAt: number; form: FlyerForm; consent: boolean };

const storage = () => {
  try {
    // Safari 시크릿 모드 등에서는 접근 자체가 예외를 던진다.
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

/** 되살릴 가치가 있는 내용이 있는지. 빈 폼을 복구 제안하지 않는다. */
export function hasDraftContent(form: FlyerForm, consent: boolean) {
  return (
    consent ||
    Boolean(
      form.name.trim() ||
        form.missingAt ||
        form.sido ||
        form.placeDetail.trim() ||
        form.notes.trim() ||
        form.contact.trim(),
    )
  );
}

export function writeDraft(caseId: string, form: FlyerForm, consent: boolean) {
  const store = storage();
  if (!store) return;
  try {
    if (!hasDraftContent(form, consent)) {
      store.removeItem(PREFIX + caseId);
      return;
    }
    store.setItem(PREFIX + caseId, JSON.stringify({ savedAt: Date.now(), form, consent }));
  } catch {
    // 용량 초과·권한 거부는 무시한다. 임시 편의 기능이라 실패해도 작성은 계속돼야 한다.
  }
}

export function readDraft(caseId: string): FlyerDraft | null {
  const store = storage();
  if (!store) return null;
  clearExpiredDrafts();
  try {
    const raw = store.getItem(PREFIX + caseId);
    if (!raw) return null;
    const draft = JSON.parse(raw) as FlyerDraft;
    if (!draft?.form || Date.now() - draft.savedAt > TTL_MS) {
      store.removeItem(PREFIX + caseId);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function clearDraft(caseId: string) {
  try {
    storage()?.removeItem(PREFIX + caseId);
  } catch {
    // 무시
  }
}

/** 만료된 임시 저장을 모두 지운다. 연락처를 오래 남기지 않기 위한 정리다. */
export function clearExpiredDrafts() {
  const store = storage();
  if (!store) return;
  try {
    const stale: string[] = [];
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      try {
        const draft = JSON.parse(store.getItem(key) ?? "null") as FlyerDraft | null;
        if (!draft?.savedAt || Date.now() - draft.savedAt > TTL_MS) stale.push(key);
      } catch {
        stale.push(key);
      }
    }
    stale.forEach((key) => store.removeItem(key));
  } catch {
    // 무시
  }
}
