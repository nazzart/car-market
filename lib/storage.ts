// Хранилище фото объявлений — Cloudflare R2 (S3-совместимое API). Всё, что знает про R2, — в этом файле.
// Браузер загружает файл сам по ссылке с подписью (presigned PUT): сервер не пропускает через себя мегабайты фото.
// Настройка — переменные R2_* в .env.local (README → «Фото: Cloudflare R2»)
import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const config = {
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucket: process.env.R2_BUCKET,
  // адрес, по которому фото видны всем: https://pub-….r2.dev или свой домен (https://foto.bestauto.lv)
  publicUrl: process.env.R2_PUBLIC_URL?.replace(/\/+$/, ""),
};

// Ключи R2 заданы — без них загрузка фото выключена (форма скажет, что фото сейчас загрузить нельзя)
export const storageReady = () => Object.values(config).every(Boolean);

let client: S3Client | undefined;
const s3 = () =>
  (client ??= new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.accessKeyId!, secretAccessKey: config.secretAccessKey! },
  }));

// Ссылка для загрузки одного файла (живёт 10 минут) и адрес, по которому он будет виден
export async function presignUpload(key: string, contentType: string): Promise<{ uploadUrl: string; url: string }> {
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
    // имя файла уникально и не меняется — браузеры и CDN могут хранить его сколько угодно
    CacheControl: "public, max-age=31536000, immutable",
  });
  const uploadUrl = await getSignedUrl(s3(), command, { expiresIn: 600 });
  return { uploadUrl, url: publicUrl(key) };
}

export const publicUrl = (key: string) => `${config.publicUrl}/${key}`;
