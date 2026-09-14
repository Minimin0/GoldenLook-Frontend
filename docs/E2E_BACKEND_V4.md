# Backend v4 최종 계약 대조 E2E

| 대상 | 커밋 |
|---|---|
| Backend | `main` `6de52d7` — feat: implement Golden Look v4 backend core |
| Integration | `main` `cb835c4` — docs: sync Backend v4 runtime handoff |
| Frontend | `feat/frontend-v4-app` |

Supabase·Gemini 실자격은 아직 없어서(Backend `docs/LIVE_RELEASE_CHECKLIST.md` 의
릴리스 게이트) 머지된 Backend 라우트를 그대로 옮긴 로컬 목업으로 돌렸다.
목업은 계약의 결함까지 같이 옮겼다. 실제와 다른 화면을 보면 확인의 의미가 없다.

## 1. 계약 일치

`lib/schemas.ts` 를 Backend `lib/contracts.ts` 와 한 줄씩 대조했다. **차이 없음.**

- `photoMode` `body_visible|face_only`
- `GarmentStatus` `known|none|unknown`, `known` 은 20색 id 필수, `type`·`brand` 선택
- `bodyType` `slim|average|heavy` (초안의 `normal` 아님)
- `GenerationStatus` `PENDING|GENERATING|GENERATED|TEMPORARY_ERROR`
- 에러 코드 11종 전부
- `glasses` 는 Integration `appearance-contract.md` 에서 빠졌고 프론트에도 없다

`flyerUrl` 은 Backend 가 상대 경로(`/api/flyer/...`)로 준다. 프론트는 이미지 주소를
`flyerImageUrl(shareId)` 로 따로 만들어 쓴다. 배포 도메인이 갈려도 깨지지 않는다.

## 2. 자동 검증

| 항목 | 결과 |
|---|---|
| 계약 E2E 21건 (`scratchpad/e2e-contract.mjs`) | 21/21 |
| 단위 테스트 45건 (`npm test`) | 45/45 |
| `npm run lint` / `build` / `typecheck` | 통과 |

계약 E2E 가 확인한 규칙

- 첫 성공은 재생성 횟수를 쓰지 않고, 이후 3회까지 허용, 4회째 `GENERATION_LIMIT`
- 생성 입력(`appearance`·`photoMode`·face_only 의 나이·키·체형)을 다시 보내면
  생성 결과와 횟수가 초기화된다 → 프론트는 바뀐 필드만 PATCH 한다
- 발행은 멱등. 이미 발행된 case 는 같은 `shareId` 를 돌려준다
- 발행 후 PATCH·generate 는 409 `CASE_PUBLISHED`, 삭제는 여전히 허용
- 남의 case 는 403 이 아니라 404 (존재 자체를 알리지 않는다)
- `shareId` 는 base64url 12자. 형식이 다르면 프론트도 Backend 도 404

## 3. 화면 E2E (iPhone 375×812)

로그인 → 사진 → 옷차림 → 예상 모습 → 전단 정보 → 발행 → 공유 → 삭제까지 통과.

- 색을 안 고르고 넘어가면 "색을 고르거나 '기억 안 나요' 를 선택해 주세요" 로 막힌다
- 생성 직후 "3번 더 만들 수 있습니다" (첫 성공은 차감 안 함)
- `/my` 에서 "이어서 작성하기" → 4단계로 복귀
- 발행 후 삭제 → 공유 링크는 "이미 내려간 전단입니다"
- 서버가 거부하는 세션이면 자동 로그아웃 후 로그인 화면

## 4. Backend 에 남은 것

### 4-1. 전단 PNG 렌더 (`app/api/flyer/[shareId]/route.ts`)

발행된 전단에서 실제로 나온 문자열이다.

```
착의: top: 남색, 반팔 티셔츠, 나이키. bottom: 회색, 트레이닝복. hat: confirmed none. shoes: 흰색.
실종 시각: 2026-09-13T15:30
연락처: 01012345678
```

1. **영어 필드명이 그대로 나온다.** 전단이 AI 프롬프트용 `clothingLines()` 를
   재사용한다. 그 함수는 모델이 읽을 문장이라 `top:`·`confirmed none.` 이 정상이지만,
   전단은 시민이 읽는다. 문자열 생성 함수는 독자가 누구인지로 나눠야 한다.
2. **실종 시각이 ISO 원문이다.** `2026년 9월 13일 오후 3시 30분` 이어야 한다.
3. **연락처에 하이픈이 없다.**
4. **1200×900 가로에 글자를 오른쪽 절반에만 넣는다.** 모바일에서 375×281 로
   줄어들어 본문 30px 이 실효 9.4px 이 되고, 긴 줄은 화면 밖으로 잘린다.

패치는 `handoff/backend-flyer-fix` 브랜치의 `handoff/backend-flyer-render.patch`
에 있다. 1080×1350 세로로 바꾸고 `lib/server/flyer.ts` 를 따로 둔다.
목업에서 `?layout=patch` 를 붙이면 적용 후 화면을 비교해 볼 수 있다.

### 4-2. `GET /api/flyer/[shareId]/meta` 는 만들지 않기로 확인됨

최종 계약 표에 없다. 프론트는 실패를 삼켜서 **전화 버튼만 빼고** 나머지는 그대로
동작한다. 안내 문구도 버튼 유무에 따라 갈라지게 고쳤다.

전단을 본 시민이 눌러서 바로 전화할 방법은 이걸로 없어졌다. 번호는 PNG 안에만
있어서 직접 읽고 옮겨 적어야 한다. 만들기로 정한다면 `contact` 하나만 내려주면
되고 프론트는 이미 붙어 있다.

## 5. 남은 것

- **실기기 E2E** — iOS Safari / Android Chrome. 배포 환경이 나와야 돈다.
  카카오 공유(SDK 키), `tel:` 링크, 사진 촬영·EXIF 회전이 여기서만 확인된다.
- **실자격 연동 확인** — Supabase Storage signed URL 만료, Gemini 실패 시
  `TEMPORARY_ERROR` 복구. Backend 릴리스 게이트와 같은 항목이다.
