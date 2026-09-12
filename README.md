# GoldenLook — UI/UX 베이스라인

Next.js 15 (App Router) + Tailwind CSS v4 기준의 프론트엔드 전체 코드입니다.
FINAL 기획서 v4.0 의 동결 항목을 UI 레벨에서 강제하도록 구성했습니다.

## 1. 설치

```bash
npm install
npm run dev
```

의존성은 `next@15`, `react@19`, `tailwindcss@4`, `@tailwindcss/postcss`, `lucide-react` 입니다.
새 프로젝트에서 시작한다면:

```bash
npx create-next-app@latest goldenlook --typescript --tailwind --app --src-dir --import-alias "@/*"
npm i lucide-react
```

그다음 이 저장소의 `src/` 와 설정 파일을 덮어쓰면 됩니다.

## 2. 파일 구조

```
src/
├─ app/
│  ├─ globals.css                 # 디자인 토큰 (네이비/시그널레드/오렌지)
│  ├─ layout.tsx                  # 480px 모바일 셸, 전체 noindex
│  ├─ page.tsx                    # 홈: 히어로 + 초기 대응 + 최근 등록
│  ├─ create/page.tsx             # 전단지 작성 4단계 플로우
│  ├─ my/page.tsx                 # 내 전단지 관리
│  ├─ not-found.tsx               # 전역 404
│  └─ flyer/[shareId]/
│     ├─ page.tsx                 # 공개 전단지 상세
│     └─ not-found.tsx            # 삭제/만료된 전단지
├─ components/
│  ├─ KakaoScript.tsx             # 카카오 공유 SDK 로더 (키 없으면 미로딩)
│  ├─ layout/AppHeader.tsx        # 브랜드 로고 + 알림
│  ├─ layout/PageHeader.tsx       # 뒤로가기 헤더
│  ├─ layout/BottomNav.tsx        # 하단 고정 내비게이션
│  ├─ ui/Button.tsx               # Button / ButtonLink
│  ├─ ui/StatusBadge.tsx          # StatusBadge / StatusRibbon / ColorChip
│  ├─ ui/ElapsedTime.tsx          # 경과 시간(골든타임) 표시
│  ├─ create/ColorPicker.tsx      # 20색 팔레트
│  ├─ create/ClothingField.tsx    # 상의/하의/모자/신발 입력
│  └─ flyer/
│     ├─ AiPhoto.tsx              # AI 라벨이 붙은 이미지 프레임
│     ├─ AppearanceBox.tsx        # 착장 강조 박스
│     ├─ FlyerCard.tsx            # 목록 카드
│     └─ ShareActions.tsx         # 전화 / 카카오톡 / 링크 복사
└─ lib/
   ├─ colors.ts                   # 20색 팔레트 contract
   ├─ regions.ts                  # 전국 시도·시군구 상수 + 지역 표기 포맷
   ├─ types.ts                    # PhotoMode, Appearance, MissingCase 등
   ├─ format.ts                   # 날짜·경과시간·전화번호 포맷
   ├─ resize-image.ts             # 업로드 전 브라우저 리사이즈
   ├─ mock-data.ts                # synthetic demo 데이터 (더미 번호만)
   └─ cn.ts
```

## 3. 디자인 토큰

`src/app/globals.css` 의 `@theme` 블록 하나만 고치면 전체 색이 바뀝니다.

| 역할 | 토큰 | 값 | 쓰는 곳 |
| --- | --- | --- | --- |
| 기본 | `navy-800` | `#0E2546` | 헤더, 주요 버튼, 착장 박스 테두리 |
| 강조 | `navy-500` | `#2C5A9E` | 보조 텍스트, 아이콘 |
| 긴급·연락 | `signal-500` | `#E8392B` | 긴급 배지, 전화 버튼, 경과 시간 |
| 수색중 | `alert-500` | `#FF7A1A` | 수색중 상태 리본/배지 |
| 배경 | `paper` | `#F4F6FB` | 섹션 구분, 보조 블록 |

포인트 색은 용도를 고정해 두었습니다. 레드를 일반 버튼에 쓰면 긴급 신호가 묻히니 섞지 마세요.

## 4. 백엔드 연결 지점

현재는 `src/lib/mock-data.ts` 를 읽습니다. 실제 연동 시 아래 4곳만 바꾸면 됩니다.

| 위치 | 바꿀 내용 |
| --- | --- |
| `app/flyer/[shareId]/page.tsx` | `getCaseByShareId` → `GET /api/flyer/[shareId]` 또는 Supabase 조회 |
| `app/page.tsx` | `getRecentCases` → 최근 발행 목록 조회 |
| `app/create/page.tsx` | `generate()` → `POST /api/cases/[id]/generate`, `publish()` → `POST /api/cases` + `/publish` |
| `app/my/page.tsx` | `markFound` / `remove` → `PATCH`, `DELETE /api/cases/[id]` |

생성 응답은 기획서 11장 형식을 그대로 씁니다.

```json
{ "status": "GENERATED", "imageUrl": "signed-or-app-url", "attempt": 1 }
```

`TEMPORARY_ERROR` 는 재생성 횟수에서 차감하지 않도록 `create/page.tsx` 의 `catch` 블록에 이미 분리해 두었습니다.

## 5. 카카오톡 공유

SDK 로더는 `components/KakaoScript.tsx` 에 들어 있고 `layout.tsx` 에서 이미 렌더됩니다.
동작시키려면 `.env.local` 에 키만 넣으면 됩니다.

```bash
NEXT_PUBLIC_KAKAO_JS_KEY=발급받은_JavaScript_키
```

키가 없으면 스크립트를 아예 로드하지 않고, `ShareActions` 가 기본 공유 시트 → 링크 복사 순으로 대체합니다.
카카오 개발자 콘솔에서 플랫폼 도메인(`http://localhost:3000`, 배포 도메인)을 등록해야 공유가 열립니다.
JS 키는 클라이언트에 노출되는 값이므로 `NEXT_PUBLIC_` 접두사를 쓰고, 서버용 Gemini/Supabase 키와 같은 파일에 두지 마세요.

공유 썸네일 기본 이미지는 `public/og-default.png` 입니다. 전단지 PNG 렌더러(`GET /api/flyer/[shareId]`)가
붙으면 `ShareActions` 의 `imageUrl` 을 그 주소로 바꾸세요.

## 6. 기획서 동결 항목이 코드에서 지켜지는 방식

- `photoMode` 분기: `create/page.tsx` 의 체크박스 하나로만 갈립니다. 기술 용어는 UI 에 노출하지 않습니다.
- 20색 팔레트: `lib/colors.ts` 외의 색 입력 경로가 없습니다. 자유 텍스트 색 입력은 만들지 마세요.
- `unknown` 정보: `describeClothing()` 이 "기억 안 남" 으로만 표기하고, 전단지에 추정값을 넣지 않습니다.
- 재생성 3회: `MAX_ATTEMPTS` 상수로 잠겨 있고, 소진 시 버튼이 비활성화됩니다.
- AI 라벨: 생성 이미지는 반드시 `AiPhoto` / `AiThumb` 을 통해서만 렌더링합니다. 라벨이 컴포넌트 안에 붙어 있어 우회할 수 없습니다.
- 연락처 전체 공개 + 사전 확인: 발행 버튼은 확인 체크박스 없이는 눌리지 않습니다.
- 112/182 없음: 전화 버튼은 보호자 연락처 하나뿐이며, 경찰 시스템처럼 보이는 요소를 넣지 않았습니다.
- noindex: `layout.tsx` 와 전단 상세의 `generateMetadata` 양쪽에서 `robots: { index: false }` 를 설정합니다.
- 더미 데이터: `mock-data.ts` 의 연락처는 전부 `010-0000-xxxx` 입니다. 실제 번호를 커밋하지 마세요.

## 7. Tailwind v3 를 쓰는 경우

v4 의 `@theme` 대신 `tailwind.config.ts` 에 색을 옮기고, `globals.css` 상단을 아래로 교체하세요.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`tailwind.config.v3.ts` 파일에 옮겨 둔 설정이 있으니 이름만 `tailwind.config.ts` 로 바꿔 쓰면 됩니다.

## 8. 백엔드 협의가 필요한 변경 (2026-09-12)

UI 에서 두 가지를 바꿨습니다. 둘 다 저장 구조에 영향이 있어 스키마 확정 전에 공유가 필요합니다.

**1. 목격 장소를 시도·시군구 선택으로 분리**

기획서 10장 데이터 모델에는 `place` 하나로 적혀 있는데, 자유 텍스트로 받으면 지역별 집계나
근처 조회를 붙일 수 없어 아래로 나눴습니다.

```ts
region: { sido: "서울특별시", sigungu: "영등포구" }   // REGIONS 상수에서만 나오는 값
placeDetail: "영등포역 1번 출구 앞 횡단보도"          // 자유 텍스트
```

- 목록은 `src/lib/regions.ts` 의 상수 배열입니다. 외부 주소 API 를 쓰지 않아 의존성이 없고,
  대신 행정구역 개편 시 파일을 직접 고쳐야 합니다.
- 세종특별자치시는 하위 시군구가 없어 `sigungu` 가 빈 문자열입니다. 저장 시 허용해야 합니다.
- DB 는 `sido`, `sigungu`, `place_detail` 세 컬럼으로 두는 편이 인덱싱에 유리합니다.

**2. 브랜드 입력을 체크박스 토글로 변경**

이전에는 항상 열린 텍스트 칸이라 "없음", "모름" 같은 문자열이 그대로 들어와
AI 프롬프트에서 처리하기 어려웠습니다. 이제 `브랜드가 기억나요` 를 체크했을 때만 입력칸이 열리고,
해제하면 값을 지웁니다. 저장 값은 실제 브랜드명이거나 `undefined` 둘 중 하나입니다.
