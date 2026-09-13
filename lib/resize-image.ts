/**
 * 업로드 전 브라우저에서 이미지를 줄인다. (기획서 2.1 P0 - 사진 업로드 및 브라우저 리사이즈)
 *
 * 고령 보호자가 찍은 원본 사진은 10MB 를 넘는 경우가 많은데 Backend 는 4MB,
 * jpeg/png/webp, 32~6000px 만 받는다. 여기서 맞춰 두면 업로드 단계에서 400 이 나지 않는다.
 */
const MAX_BYTES = 4 * 1024 * 1024;
const MIN_SIDE = 32;

export type PreparedPhoto = {
  file: File;
  /** 미리보기용 object URL. 화면에서 교체·해제할 때 revoke 한다. */
  previewUrl: string;
};

export async function preparePhoto(file: File, maxSide = 1440): Promise<PreparedPhoto> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 올릴 수 있습니다.");
  }

  const bitmap = await loadBitmap(file);
  if (bitmap.width < MIN_SIDE || bitmap.height < MIN_SIDE) {
    throw new Error("사진이 너무 작습니다. 조금 더 큰 사진을 올려 주세요.");
  }

  // 4MB 안에 들어올 때까지 크기와 품질을 차례로 낮춘다.
  for (const [side, quality] of [
    [maxSide, 0.85],
    [maxSide, 0.7],
    [1024, 0.7],
    [768, 0.65],
  ] as const) {
    const blob = await toJpeg(bitmap, side, quality);
    if (blob && blob.size <= MAX_BYTES) {
      const jpeg = new File([blob], renameToJpg(file.name), { type: "image/jpeg" });
      return { file: jpeg, previewUrl: URL.createObjectURL(jpeg) };
    }
  }

  throw new Error("사진 용량이 너무 큽니다. 다른 사진을 선택해 주세요.");
}

async function toJpeg(
  bitmap: CanvasImageSource & { width: number; height: number },
  maxSide: number,
  quality: number,
) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(MIN_SIDE, Math.round(bitmap.width * scale));
  canvas.height = Math.max(MIN_SIDE, Math.round(bitmap.height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("사진을 처리하지 못했습니다. 다른 사진을 선택해 주세요.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

async function loadBitmap(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
  try {
    // iOS 사진의 EXIF 회전을 브라우저가 처리하게 둔다.
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // createImageBitmap 이 없거나 옵션을 못 받는 구형 Safari 대체 경로
    return loadImageElement(file);
  }
}

function loadImageElement(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("사진을 불러오지 못했습니다. 다른 사진을 선택해 주세요."));
    };
    image.src = url;
  });
}

function renameToJpg(name: string) {
  return `${name.replace(/\.[^.]+$/, "") || "photo"}.jpg`;
}
