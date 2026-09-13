<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version may contain APIs and conventions newer than model training data. Before changing framework behavior, inspect the relevant guide under `node_modules/next/dist/docs/` and follow deprecation notices.

<!-- END:nextjs-agent-rules -->

# GoldenLook-Frontend Agents - v4.0

## 역할
Golden Look의 모바일 중심 Frontend입니다. 로그인, 사진 업로드, 사진 유형 선택, 옷 정보 선택, AI 생성 결과 확인/재생성, 전단 발행·공유, 내 전단 관리를 담당합니다.

## v4 핵심 흐름

- `얼굴만 나온 사진인가요?` 미체크 → `body_visible`: 기존 몸 사진의 옷 색/형태 편집
- 체크 → `face_only`: 얼굴 사진 + 나이/키/성별/체형 + 옷 정보로 예상 몸 생성
- 옷 색은 20색 팔레트 직접 선택
- Gemini 자연어 parsing은 사용하지 않음
- 결과 문구: `AI로 재현한 예상 모습`
- 재생성 최대 3회

## 수정 가능 영역
`app/`, `components/`, `lib/`, `public/`, `tests/`, `docs/`.

## 구현 상태

화면은 모두 구현돼 있고 Backend v4 API에 연결돼 있습니다.

| 경로 | 로그인 | 내용 |
|---|---|---|
| `/` | 불필요 | 랜딩 |
| `/demo` | 불필요 | synthetic 30초 체험 |
| `/login` | - | Email/Password 로그인·회원가입 |
| `/create` | 필요 | 4단계 위저드 (`?case=<id>` 로 이어서 작성) |
| `/my` | 필요 | 내 전단 목록 / 공유 / 삭제 |
| `/c/[shareId]` | 불필요 | 공개 전단 PNG + 공유 |

`lib/api/cases.ts` 밖에서 Backend를 직접 `fetch` 하지 않습니다. 토큰 부착과 ErrorCode 해석이 한 곳에 있습니다.

## Backend 동작상 주의점

화면을 고칠 때 아래를 깨면 사용자가 만든 결과가 조용히 날아갑니다.

- **생성 입력을 다시 PATCH하면 Backend가 생성 결과와 재생성 횟수를 초기화합니다.**
  `appearance`, 사진, `photoMode`, 그리고 `face_only`의 `age`/`heightCm`/`bodyProfile`이 해당합니다.
  위저드는 실제로 바뀐 값만 담아 보냅니다. 단계 이동마다 통째로 PATCH 하지 마세요.
- **이미지 URL은 300초 signed URL** 입니다. 저장하지 말고, 만료되면 case를 다시 읽습니다.
- **재생성 횟수는 서버가 셉니다.** 첫 성공은 차감되지 않고 이후 3회가 허용되며, 실패한 시도는 차감되지 않습니다.
  화면에서 따로 세면 기획서 5.4와 어긋납니다.
- **발행 후에는 삭제만 가능합니다** (`CASE_PUBLISHED`).
- 20색은 `lib/generated/colors.json` 한 곳에서만 옵니다. 여기에 색을 추가하면 Backend가 `INVALID_INPUT` 으로 거절합니다.
- 목격 장소는 화면에서 시도·시군구로 받고 `composePlace()` 로 계약의 `place` 한 칸에 합칩니다.
- 날짜는 `Intl.DateTimeFormat` 대신 `lib/format.ts` 의 KST 고정 포맷터를 씁니다.
  Node 와 브라우저의 ICU 데이터가 달라 `AM` / `오전` 처럼 갈리면 hydration 오류가 납니다.
- 버튼을 비활성화할 때는 이유를 함께 보여 줍니다. 위저드는 `blockers` 목록을 버튼 위에 출력합니다.
- `/demo` 는 합성 데이터 전용입니다. 실제 인물 사진이나 실제 연락처를 넣지 않습니다.
- 하단 고정 바는 `globals.css` 의 `.app-bar` 를 씁니다. `fixed inset-x-0` 로 두면 바탕이
  화면 전체 폭으로 깔려서 가운데 정렬된 480px 앱 셸과 어긋나 보입니다.
- 공개 전단(`/c/[shareId]`)에는 링크로 들어온 사람이 빠져나갈 경로가 항상 있어야 합니다.
- 브라우저에 세션이 남아 있어도 서버 기준으로는 만료·폐기됐을 수 있습니다.
  API 가 401 을 돌려주면 `setUnauthorizedHandler` 로 세션을 정리해 로그인 화면으로 보냅니다.
  화면 안에 "로그인이 필요합니다" 만 띄우면 로그인한 것처럼 보이는 채로 갇힙니다.

UI 시안(`reference/design-ui`) 반영 내역과 팀 확인 대기 항목은 `docs/UI_BASELINE_REVIEW.md` 에 있습니다.

## 최소 계약
팀 간 통합을 위해 아래만 임의 변경하지 않습니다.

- `photoMode`: `body_visible | face_only`
- 20색 color id
- unknown 정보를 사실처럼 확정하지 않는 원칙
- generate 결과를 표시할 수 있는 API contract
- 재생성 최대 3회
- 결과 라벨 `AI로 재현한 예상 모습`
- 로그인/소유권
- 112/182 미구현
- 작성자 삭제

## AI 팀 변경 대응
AI 담당자는 Backend 내부 provider/model/prompt/pipeline을 자유롭게 변경할 수 있습니다. Frontend는 provider 구현에 의존하지 말고 앱-facing generate DTO만 사용합니다.

AI 팀이 Frontend 입력 또는 API DTO 변경을 보고하면 해당 PR에서 contract 영향도를 확인한 뒤 조정합니다.

## Secret
Frontend에는 public client 설정만 둡니다. Service Role, Gemini API key, server secret은 브라우저 bundle에 들어가면 안 됩니다.

## 브랜치/PR
- `main`: Production-ready
- 작업 브랜치: `feat/*`, `fix/*`, `docs/*`, `chore/*`
- 화면 PR은 screenshot/evidence 포함
- contract 변경이면 Integration 영향을 명시

## 검증
Merge 전 최소 `npm run lint`, `npm run build`.
