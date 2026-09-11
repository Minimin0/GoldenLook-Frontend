<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GoldenLook-Frontend Agents

## 역할
Golden Look의 모바일 중심 Next.js Frontend입니다. 실종자 사진과 보호자의 옷차림 설명 입력, Gemini 보조 결과 확인, 전단 결과 확인 및 공유 UX를 담당합니다.

## 수정 가능한 영역
Frontend 동작은 `app/`, `components/`, `lib/`, `public/`, `tests/`에서만 수정합니다. Backend API, Modal AI, Supabase server code, Integration evidence는 각 담당 Repository에서 관리합니다.

## 수정 금지 계약
팀장 승인 없이 변경하지 않습니다: appearance shape, `known` / `none` / `unknown` 의미, 20 color ids, API 6개 경로, 원본 사진 병기, 얼굴/몸/포즈 생성 금지, Gemini 사용자 확인, AI failure fallback, private storage 원칙.

## Secret 관리
Frontend에는 `NEXT_PUBLIC_*` 변수만 둡니다. `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `MODAL_API_KEY`, `CRON_SECRET`는 frontend code, env file, browser bundle에 들어가면 안 됩니다. `.env.example`만 커밋하고 실제 `.env*`는 커밋하지 않습니다.

## 브랜치 전략
`main`은 Production-ready 상태만 유지합니다. 기본 작업은 `develop`에서 시작하며, 브랜치는 `feat/*`, `fix/*`, `docs/*`, `chore/*` 형식을 사용합니다.

## PR 원칙
PR은 작게 유지하고 product contract 영향 여부를 적습니다. 화면 변경은 screenshot을 함께 남깁니다.

## 테스트 원칙
Merge 전 `npm run lint`, `npm run build`를 실행합니다. 복잡한 로직이 생길 때만 가장 작은 유효 테스트를 추가합니다.

## 아키텍처 원칙
로그인, 음성, Firebase, Spring Boot, 4번째 AI Repository, frontend-owned secret을 임의로 추가하지 않습니다. Integration contract는 향후 source of truth가 될 수 있습니다.
