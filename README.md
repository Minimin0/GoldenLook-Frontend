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

## Frontend P0

- Email/Password 로그인/회원가입
- 사진 유형 체크 + 사진 업로드
- 20색 팔레트
- 상의/하의/모자/신발/소지품 입력
- face_only 몸 정보 입력
- AI 생성/편집 loading/result
- 재생성 최대 3회
- publish/share
- 내 전단/delete

## MVP 제외

- Gemini 자연어 parsing
- 112/182 신고 버튼
- 앱 자체 제보
- Kakao/Google 로그인

## AI 구현과의 관계

Frontend는 Gemini 모델명이나 provider 구현을 알 필요가 없습니다. Backend의 app-facing generate API contract만 사용합니다. AI 담당자는 provider/model/prompt/pipeline을 자유롭게 수정할 수 있고, Frontend 입력/DTO에 영향이 생길 때만 변경 내용을 공유합니다.

## 환경변수

```text
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_KAKAO_JS_KEY=
NEXT_PUBLIC_BASE_URL=
```

실제 `.env*`와 Backend secret은 커밋하지 않습니다.

## 검증

```bash
npm install
npm run lint
npm run build
```

최종 제품 기준은 [GoldenLook-Integration](https://github.com/Minimin0/GoldenLook-Integration)의 v4 문서를 source of truth로 사용합니다.
