"use server";

// Server Actions формы подачи: ссылки для загрузки фото в хранилище и сохранение объявления.
// Порядок в браузере: фото → requestPhotoUploads → PUT каждого файла → submitListing с адресами фото
import { updateTag } from "next/cache";

import { requireUser } from "@/features/auth/api";
import { presignUpload, storageReady } from "@/lib/storage";

import { type CreateListingResult, createListing, photoFolder } from "./api";
import { MAX_PHOTOS } from "./lib/parseListing";
import type { SellFormData } from "./types";

const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // браузер сжимает фото до ~1 МБ; 10 МБ — с запасом для PNG

export type PhotoUploadsResult =
  | { ok: true; uploads: { uploadUrl: string; url: string }[] }
  | { ok: false; error: "storage" | "invalid" };

// Ссылки для загрузки фото: по одной на файл, в папку пользователя (listings/{userId}/{uuid}.jpg)
export async function requestPhotoUploads(files: { type: string; size: number }[]): Promise<PhotoUploadsResult> {
  const user = await requireUser();
  if (!storageReady()) return { ok: false, error: "storage" };

  const valid =
    Array.isArray(files) &&
    files.length > 0 &&
    files.length <= MAX_PHOTOS &&
    files.every((f) => PHOTO_TYPES[f?.type] && Number.isFinite(f?.size) && f.size > 0 && f.size <= MAX_PHOTO_BYTES);
  if (!valid || user.blocked) return { ok: false, error: "invalid" };

  const uploads = await Promise.all(
    files.map((f) => presignUpload(`${photoFolder(user)}${crypto.randomUUID()}.${PHOTO_TYPES[f.type]}`, f.type))
  );
  return { ok: true, uploads };
}

// Сохранить объявление. Новое — на проверке у модератора, покупателям пока не видно
export async function submitListing(input: Partial<SellFormData>): Promise<CreateListingResult> {
  const user = await requireUser();
  const result = await createListing(user, typeof input === "object" && input ? input : {});
  if (result.ok) updateTag("listings");
  return result;
}
