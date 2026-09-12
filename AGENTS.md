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
`app/`, `components/`, `lib/`, `public/`, `tests/`.

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
