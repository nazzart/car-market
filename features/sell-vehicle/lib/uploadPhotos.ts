// Фото объявления → хранилище (браузер). Перед загрузкой фото уменьшаются до 1920 px по длинной стороне
// и сохраняются в JPEG: так 12-мегапиксельный снимок с телефона весит ~0,5–1 МБ вместо 5–8 МБ
import { requestPhotoUploads } from "../actions";

const MAX_SIDE = 1920;
const QUALITY = 0.85;

// object URL превью (PhotosSection) → уменьшенный JPEG
async function shrink(objectUrl: string): Promise<Blob> {
  const source = await (await fetch(objectUrl)).blob();
  const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/jpeg", QUALITY)
  );
}

export type UploadError = "storage" | "upload";

// Загрузить фото по порядку (первое — обложка); onProgress(готово, всего). Результат — адреса фото в хранилище
export async function uploadPhotos(
  objectUrls: string[],
  onProgress: (done: number, total: number) => void
): Promise<{ ok: true; urls: string[] } | { ok: false; error: UploadError }> {
  if (objectUrls.length === 0) return { ok: true, urls: [] };
  onProgress(0, objectUrls.length);

  let blobs: Blob[];
  try {
    blobs = await Promise.all(objectUrls.map(shrink));
  } catch {
    return { ok: false, error: "upload" };
  }

  const links = await requestPhotoUploads(blobs.map((b) => ({ type: b.type, size: b.size })));
  if (!links.ok) return { ok: false, error: links.error === "storage" ? "storage" : "upload" };

  let done = 0;
  try {
    await Promise.all(
      links.uploads.map(async ({ uploadUrl }, i) => {
        const response = await fetch(uploadUrl, { method: "PUT", body: blobs[i], headers: { "Content-Type": blobs[i].type } });
        if (!response.ok) throw new Error(`upload ${response.status}`);
        onProgress(++done, blobs.length);
      })
    );
  } catch {
    return { ok: false, error: "upload" };
  }

  return { ok: true, urls: links.uploads.map((u) => u.url) };
}
