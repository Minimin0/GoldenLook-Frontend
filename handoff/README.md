# Backend 전달용 패치

이 브랜치는 **Backend 담당자가 그대로 적용할 수 있는 패치**만 담고 있습니다.

`GoldenLook-Backend` 저장소에는 직접 올리지 않았습니다. 담당자가 확인한 뒤 본인 브랜치에서
적용하고 커밋하면 됩니다.

- 대상 저장소: `GoldenLook-Backend`
- 대상 브랜치: `feat/backend-v4-core` (커밋 `83e7b01` 기준)
- 이 브랜치는 Frontend `main` 에서 갈라져 나왔습니다. Frontend v4 구현(`feat/frontend-v4-app`)과
  파일이 겹치지 않아 서로 영향을 주지 않습니다.

## 적용

```bash
cd GoldenLook-Backend
git switch feat/backend-v4-core
git apply /경로/backend-flyer-render.patch
npm run lint && npx tsc --noEmit && npm test
```

## 무엇을 고치나

공개 전단 PNG(`GET /api/flyer/[shareId]`) 렌더링 네 가지입니다. 계약(API 경로, DTO, DB)은
건드리지 않고 그리는 방식만 바꿉니다.

### 1. 영어 필드명이 공개 전단에 노출됨

렌더러가 Gemini 프롬프트용 헬퍼 `clothingLines()` 를 그대로 재사용하고 있습니다.
그 함수는 AI 에게 넘기려고 만든 것이라 영어 키를 씁니다.

```text
현재: 착의: top: 흰색, 니트. bottom: 검정, 청바지. hat: confirmed none. shoes: confirmed none.
수정: 상의: 흰색 니트
      하의: 검정 청바지
      모자: 착용 안 함
      신발: 착용 안 함
```

`lib/server/flyer.ts` 에 전단 전용 `flyerClothingLines()` 를 새로 두고, AI 프롬프트용
`lib/server/ai/prompt.ts` 는 건드리지 않습니다. 프롬프트와 전단은 목적이 달라서 같이 쓰면
한쪽을 고칠 때 다른 쪽이 깨집니다.

### 2. 착장이 읽히지 않음

네 항목이 한 줄에 뭉쳐서 24px 로 들어갑니다. 1200px 이미지가 모바일에서 480px 로 줄면
10px 아래로 떨어져 읽을 수 없습니다.

지나가던 사람이 대조하는 건 얼굴보다 옷입니다. 항목마다 줄을 나누고 테두리 박스에 32px 볼드로
넣어 제목 다음으로 눈에 들어오게 했습니다.

### 3. 브랜드가 옷 이름에 섞임

`[색, 종류, 브랜드]` 를 그냥 이어 붙여서 `검정 패딩 나이키` 가 됩니다. 읽는 사람은 "나이키" 가
브랜드인지 옷 종류의 일부인지 알 수 없습니다. → `검정 패딩 (나이키)`

### 4. 특이사항에 라벨이 없음

`notes` 를 본문만 찍습니다. 보호자가 "없음" 이라고 적으면 전단에 빨간 글씨로 `없음` 한 단어만
남고, 무엇이 없다는 뜻인지 알 수 없습니다. → `특이사항` 라벨을 위에 붙입니다.

## 검증

로컬 `GoldenLook-Backend` 클론에서 `feat/backend-v4-core` 에 적용해 확인했습니다.

- `npx tsc --noEmit` 통과
- `npm run lint` 통과
- `npm test` — 8 파일 32개 테스트 전부 통과
- `git apply --check` 통과 (`83e7b01` 기준 충돌 없음)

`next/og`(satori)는 자식이 둘 이상인 div 에 `display: "flex"` 를 명시해야 하므로 패치에 포함돼
있습니다.

## 아직 패치에 없는 것

**공개 전단의 전화 버튼** — 지금은 공개 경로가 PNG 하나뿐이라 전화번호가 이미지 안에만 있습니다.
링크를 받은 이웃·상인이 번호를 손으로 옮겨 적어야 합니다.

`GET /api/flyer/[shareId]/meta` 처럼 **이미 PNG 에 찍혀 있는 공개 필드만** 돌려주는 경로가 있으면
Frontend 가 `tel:` 버튼을 붙일 수 있습니다. 새로 노출되는 정보는 없습니다.

```json
{ "name": "...", "age": 78, "heightCm": 152, "missingAt": "...", "place": "...",
  "contact": "010-...", "notes": "...", "appearance": { }, "label": "AI로 재현한 예상 모습" }
```

API 계약 추가라 팀 합의가 필요해서 패치에 넣지 않았습니다.
