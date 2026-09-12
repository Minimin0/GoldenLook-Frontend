/**
 * 업로드 전 브라우저에서 이미지를 줄인다. (기획서 2.1 P0 - 사진 업로드 및 브라우저 리사이즈)
 * 고령 보호자가 찍은 원본 사진은 10MB 를 넘는 경우가 많아 그대로 올리면 생성이 느려진다.
 */
export async function resizeImage(file: File, maxSide = 1280, quality = 0.85): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  if (scale === 1) return dataUrl;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("사진을 읽지 못했습니다. 다른 사진을 선택해 주세요."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("사진을 불러오지 못했습니다."));
    image.src = src;
  });
}
