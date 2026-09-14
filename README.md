# Golden Look Frontend

## 저장소

| 저장소 | 역할 |
|---|---|
| **GoldenLook-Frontend** | 사용자 화면, 사진/옷 정보 입력, AI 결과 확인, 전단/공유/관리 |
| [GoldenLook-Backend](https://github.com/Minimin0/GoldenLook-Backend) | Auth, Case API, Storage, 이미지 AI orchestration, 전단 생성 |
| [GoldenLook-Integration](https://github.com/Minimin0/GoldenLook-Integration) | v4 제품 계약, E2E, 배포·평가 evidence |

## Golden Look v4

Golden Look은 보호자가 제공한 실종자 사진과 실종 당시 정보를 바탕으로 **AI가 예상 모습을 재현해 모바일 전단으로 발행·공유하는 서비스**입니다.

사진 업로드 시 `얼굴만 나온 사진인가요?`를 사용자가 직접 선택합니다.

- 미체크: 몸이 나온 사진 → AI가 옷의 **색과 형태를 편집**
- 체크: 얼굴만 나온 사진 → 나이·키·성별·체형·옷 정보를 반영해 **예상 몸 생성**

옷 색은 Gemini 자연어 분석이 아니라 **20색 팔레트에서 직접 선택**합니다.

AI 결과에는 `AI로 재현한 예상 모습`을 표시하며 재생성은 최대 3회입니다.

## 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

`.env.local`

```text
NEXT_PUBLIC_API_BASE_URL=      # Backend 배포 origin. 비우면 같은 origin
NEXT_PUBLIC_SUPABASE_URL=      # Supabase Auth (Email/Password)
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_KAKAO_JS_KEY=      # 없으면 기본 공유 시트 → 링크 복사로 대체
NEXT_PUBLIC_BASE_URL=          # 공유 링크에 쓰는 Frontend 주소
```

Backend `.env` 의 `CORS_ALLOWED_ORIGINS` 에 Frontend origin을 정확히 등록해야 합니다. 브라우저가 `Authorization` 헤더를 붙이므로 모든 private 요청 앞에 preflight(`OPTIONS`)가 먼저 나갑니다.

실제 `.env*`와 Backend secret은 커밋하지 않습니다. Service Role key, Gemini API key는 이 저장소에 두지 않습니다.

## 화면

| 경로 | 로그인 | 내용 |
|---|---|---|
| `/` | 불필요 | 랜딩, 초기 대응 안내, 두 사진 모드 설명 |
| `/demo` | 불필요 | synthetic 30초 체험 (예시 전단, Backend 호출 없음) |
| `/login` | - | Email/Password 로그인·회원가입 |
| `/create` | 필요 | 4단계 작성 위저드 (`?case=<id>` 로 이어서 작성) |
| `/my` | 필요 | 내 전단 목록, 공유, 삭제 |
| `/c/[shareId]` | 불필요 | 공개 전단 (Backend가 렌더한 PNG) + 공유 |

### 작성 위저드 4단계

1. **사진** — 카메라/앨범 업로드, 브라우저 리사이즈, `얼굴만 나온 사진인가요?` 체크, 체크 시 나이·키·성별·체형 → `POST /api/cases`
2. **옷차림** — 상의/하의/모자/신발 상태(기억나요·안 썼어요·기억 안 나요) + 20색 + 종류/브랜드(선택) + 소지품 → `PATCH /api/cases/[id]`
3. **예상 모습** — `POST /api/cases/[id]/generate`, 재생성은 서버가 알려 주는 `regenerationsRemaining` 만큼
4. **전단 정보** — 이름·나이·키·시각·지역·상세 위치·특이사항·연락처 + 연락처 전체 공개 확인 → `PATCH` 후 `POST /api/cases/[id]/publish`

## 구조

```text
app/
├─ layout.tsx              # 480px 모바일 셸, AuthProvider, 전체 noindex
├─ globals.css             # 디자인 토큰 (navy / signal red / alert orange)
├─ page.tsx                # 홈
├─ login/page.tsx          # 로그인·회원가입
├─ create/page.tsx         # 4단계 위저드 + API 호출 orchestration
├─ my/page.tsx             # 내 전단 목록 / 삭제
├─ c/[shareId]/            # 공개 전단 (server metadata + client view)
└─ not-found.tsx
components/
├─ auth/                   # AuthProvider, RequireAuth
├─ layout/                 # AppHeader, PageHeader, BottomNav
├─ ui/                     # Button, Field, StatusBadge/ColorChip
├─ create/                 # PhotoStep, AppearanceStep, GenerateStep, FlyerInfoStep, ColorPicker, ClothingField, RegionSelect
├─ flyer/                  # AiPhoto, AppearanceBox, CaseCard
└─ share/                  # KakaoScript, ShareActions
lib/
├─ api/client.ts           # fetch 래퍼, Bearer 토큰, ErrorCode
├─ api/cases.ts            # 앱-facing 6개 경로만 호출
├─ generated/colors.json   # Integration contracts/colors.json 사본 (동결)
├─ colors.ts, appearance.ts, schemas.ts
├─ regions.ts, format.ts, resize-image.ts, cn.ts
└─ supabase.ts             # 브라우저 전용 client (anon key)
```

## Backend 계약과의 관계

Frontend는 [API_CONTRACT_v4](https://github.com/Minimin0/GoldenLook-Backend/blob/feat/backend-v4-core/docs/API_CONTRACT_v4.md)의 앱-facing 경로만 사용합니다.

```text
GET|POST   /api/cases
GET|PATCH|DELETE /api/cases/[id]
POST       /api/cases/[id]/generate
POST       /api/cases/[id]/publish
GET        /api/flyer/[shareId]
```

작업하면서 반드시 지켜야 하는 Backend 동작이 몇 가지 있습니다.

- **생성 입력을 다시 PATCH하면 결과가 초기화됩니다.** `appearance`, 사진, `photoMode`, 그리고 `face_only`의 `age`/`heightCm`/`bodyProfile`이 여기 해당합니다. 위저드는 실제로 바뀐 값만 담아 보냅니다.
- **이미지 URL은 300초짜리 signed URL** 입니다. 저장하지 말고 만료되면 case를 다시 읽습니다. (`AiPhoto`/`AiThumb`의 `onExpired`)
- **재생성 횟수는 서버가 셉니다.** 첫 성공은 차감되지 않고 이후 3회가 허용되며, 실패한 시도는 차감되지 않습니다. 화면에서 따로 세지 않습니다.
- **발행 후에는 삭제만 가능합니다.** (`CASE_PUBLISHED`)
- `age`는 1–120, `heightCm`는 40–230, 연락처는 숫자 7–15자리입니다.

Frontend는 Gemini 모델명이나 provider 구현을 알 필요가 없습니다. AI 담당자는 provider/model/prompt/pipeline을 자유롭게 수정할 수 있고, Frontend 입력/DTO에 영향이 생길 때만 변경 내용을 공유합니다.

## 기획서 동결 항목이 코드에서 지켜지는 방식

- `photoMode` 분기: `PhotoStep`의 체크박스 하나로만 갈리고, 기술 용어는 화면에 노출하지 않습니다.
- 20색 팔레트: `lib/generated/colors.json` 외의 색 입력 경로가 없습니다. 스와치 색상값도 contract의 rgb를 그대로 씁니다.
- `unknown`: `describeGarment()`가 "기억 안 남"으로만 표기하고, 색을 고르지 않은 `known` 항목은 제출 시 `unknown`으로 내려갑니다. 추정값을 전단에 넣지 않습니다.
- 재생성 3회: 서버의 `regenerationsRemaining`이 0이면 버튼이 비활성화됩니다.
- AI 라벨: 생성 이미지는 `AiPhoto`/`AiThumb`을 통해서만 렌더링하고, 라벨이 컴포넌트 안에 붙어 있습니다.
- 연락처 전체 공개 + 사전 확인: 확인 체크박스 없이는 발행 버튼이 눌리지 않습니다.
- 112/182 없음: 신고 버튼도, 경찰 시스템처럼 보이는 요소도 없습니다.
- noindex: `app/layout.tsx`와 공개 전단의 `generateMetadata` 양쪽에서 설정합니다.
- 작성자 삭제: `/my`에서 확인 다이얼로그 후 `DELETE`.
- 자동 삭제 안내: `AUTO_DELETE_NOTICE`("최대 48시간 이내") 한 곳에서만 옵니다. cron이 하루 1회라 실제 삭제는 24~48시간 사이이며, 남은 시간을 세어 보여 주지 않습니다.
- 작성 중 임시 저장: `lib/draft.ts`가 4단계 입력을 브라우저에만 담아 둡니다. 서버 API도 DB도 쓰지 않고, 발행·삭제 시 즉시 지우며 6시간 뒤 만료됩니다.
- synthetic demo: `/demo`는 `lib/demo.ts`의 합성 값만 씁니다. 인물은 사진이 아니라 일러스트(`public/demo-figure.svg`)이고 연락처는 더미 `010-0000-0000` 한 개이며 전화 링크를 걸지 않습니다.
- 날짜 표기: `Intl` 을 쓰지 않고 KST 고정으로 직접 포맷합니다. 실행 환경 ICU 차이로 서버와 브라우저 출력이 갈리면 hydration 오류가 납니다.

## MVP 제외

- Gemini 자연어 parsing
- 112/182 신고 버튼
- 앱 자체 제보
- Kakao/Google 로그인

## 검증

```bash
npm run lint
npm run build
```

UI/UX 시안(`reference/design-ui`)과의 비교 및 계약 정렬 내역은 [docs/UI_BASELINE_REVIEW.md](docs/UI_BASELINE_REVIEW.md)에 있습니다.

최종 제품 기준은 [GoldenLook-Integration](https://github.com/Minimin0/GoldenLook-Integration)의 v4 문서를 source of truth로 사용합니다.
