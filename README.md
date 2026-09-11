# Golden Look Frontend

## 🔗 Golden Look 저장소 바로가기

| 저장소 | 역할 |
|---|---|
| [🎨 GoldenLook-Frontend](https://github.com/Minimin0/GoldenLook-Frontend) | 사용자 화면, 모바일 UX, 사진 업로드, 결과 확인 및 공유 |
| [⚙️ GoldenLook-Backend](https://github.com/Minimin0/GoldenLook-Backend) | API, Supabase, Gemini, 전단 생성, SegFormer + LAB 이미지 처리 |
| [🔗 GoldenLook-Integration](https://github.com/Minimin0/GoldenLook-Integration) | 공통 계약, E2E 검증, 배포 기록, 평가 및 Production 관리 |

> 현재 저장소: **GoldenLook-Frontend**
>
> Golden Look의 사용자 인터페이스와 모바일 웹 경험을 담당합니다.

Golden Look의 사용자 인터페이스를 담당하는 Frontend Repository입니다.

Golden Look은 실종자 보호자가 사진 한 장과 실종 당일 옷차림을 입력하면, AI가 옷 정보를 구조화하고 사진 속 의류 색상을 참고용으로 시각화한 뒤 모바일 실종 전단을 생성할 수 있도록 돕는 서비스입니다.

## 프로젝트 개요

Frontend는 보호자가 사진과 자연어 설명을 입력하고, Gemini가 정리한 옷차림 정보를 확인·수정하며, 원본 사진과 참고 이미지를 함께 포함한 전단 결과를 확인하고 공유하는 흐름을 제공합니다.

## Frontend 역할

- 모바일 중심 사용자 UX
- 사진 업로드 및 케이스 생성 화면
- Gemini 파싱 결과 확인·수정 화면
- 전단 결과 및 공유 화면
- Backend API 호출을 위한 클라이언트 연동

## 주요 사용자 흐름

```text
사진 업로드
→ 옷차림 자연어 입력
→ Gemini 결과 확인·수정
→ 전단 결과 확인
→ 공유
```

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Node 22 LTS 기준

## 디렉터리 구조

- `app/`: 홈, 케이스 생성, 설명 확인, 결과, 공유 라우트
- `components/`: upload, appearance, flyer, share, ui 컴포넌트
- `lib/`: API helper, appearance type, schema, color contract
- `tests/`: Frontend 테스트

## 🔌 Backend 연동

Frontend는 GoldenLook-Backend의 API를 호출하여 동작합니다.

Backend Repository:

[GoldenLook-Backend](https://github.com/Minimin0/GoldenLook-Backend)

API Base URL은 `NEXT_PUBLIC_API_BASE_URL` 환경변수로 관리합니다.

## 환경변수

`.env.example`만 커밋합니다. 실제 `.env*` 파일은 커밋하지 않습니다.

```text
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_KAKAO_JS_KEY=
NEXT_PUBLIC_BASE_URL=
```

Frontend에는 `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `MODAL_API_KEY`, `CRON_SECRET` 같은 Backend Secret이 존재하면 안 됩니다.

## 로컬 실행

```bash
npm install
npm run lint
npm run build
```

## 브랜치 전략

`main`은 Production-ready 상태만 유지합니다. 기본 개발은 `develop`에서 시작하며, 작업 브랜치는 `feat/*`, `fix/*`, `docs/*`, `chore/*` 형식을 사용합니다.

## 개발 워크플로

6개 Backend API 경로를 기준으로 구현합니다. Gemini 결과는 사용자가 반드시 확인해야 하며, AI 실패 시에도 원본 사진 기반 전단 생성 흐름이 유지되어야 합니다.

## 보안 원칙

개인정보, 실제 사진, API Key, Service Role Key, 실제 `.env*` 파일은 커밋하지 않습니다. 원본 사진 병기, 얼굴·몸·포즈 생성 금지, Gemini 사용자 확인 원칙은 변경하지 않습니다.

## 현재 상태

Wanted AI Championship 2026 제출을 위한 초기 Frontend Skeleton 상태입니다.
