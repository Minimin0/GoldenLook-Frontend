import { apiBaseUrl, apiRequest } from "@/lib/api/client";
import type {
  CaseDto,
  CaseListItem,
  CasePatch,
  GenerationResult,
  PhotoMode,
} from "@/lib/schemas";

/**
 * Backend v4 의 앱-facing 경로만 사용한다. (기획서 11. API 기준)
 * AI provider/model/prompt 가 바뀌어도 여기는 그대로다.
 */

export type CreateCaseInput = {
  photo: File;
  photoMode: PhotoMode;
  age?: number | null;
  heightCm?: number | null;
  bodyProfile?: CasePatch["bodyProfile"];
  appearance?: CasePatch["appearance"];
};

export async function createCase(input: CreateCaseInput): Promise<CaseDto> {
  const { photo, photoMode, ...rest } = input;
  const form = new FormData();
  form.set("photo", photo);
  form.set("photoMode", photoMode);
  form.set("data", JSON.stringify(rest));
  return apiRequest<CaseDto>("/api/cases", { method: "POST", body: form });
}

export function getCase(id: string) {
  return apiRequest<CaseDto>(`/api/cases/${id}`);
}

export async function listCases() {
  const data = await apiRequest<{ cases: CaseListItem[] }>("/api/cases");
  return data.cases ?? [];
}

export function patchCase(id: string, patch: CasePatch) {
  return apiRequest<CaseDto>(`/api/cases/${id}`, { method: "PATCH", json: patch });
}

/** 사진을 바꾸면 Backend 가 생성 결과와 재생성 횟수를 초기화한다. */
export function replaceCasePhoto(id: string, photo: File, patch: CasePatch = {}) {
  const form = new FormData();
  form.set("photo", photo);
  form.set("data", JSON.stringify(patch));
  return apiRequest<CaseDto>(`/api/cases/${id}`, { method: "PATCH", body: form });
}

export function deleteCase(id: string) {
  return apiRequest<void>(`/api/cases/${id}`, { method: "DELETE" });
}

export function generateCase(id: string) {
  return apiRequest<GenerationResult>(`/api/cases/${id}/generate`, { method: "POST" });
}

export function publishCase(id: string) {
  return apiRequest<{ shareId: string; flyerUrl: string }>(`/api/cases/${id}/publish`, {
    method: "POST",
  });
}

/** 공개 전단 PNG. 로그인 없이 접근한다. */
export function flyerImageUrl(shareId: string) {
  return `${apiBaseUrl()}/api/flyer/${shareId}`;
}
