import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const isDev = process.env.NODE_ENV !== "production";

// Внешние сервисы, которые страница загружает сама. Новый сервис (карты MapTiler, CDN фото…) — добавить сюда,
// иначе браузер его заблокирует. Обычные ссылки (CSDD, WhatsApp, Facebook) сюда не нужны
const sources = {
  images: [
    "https://img.youtube.com", // превью видео продавца
  ],
  // карта и адреса — с нашего сервера; если файлы карты переедут на CDN (NEXT_PUBLIC_MAP_BASE) — добавить его сюда
  connect: [] as string[],
  frames: [
    "https://www.youtube-nocookie.com", // видео продавца
  ],
};

// Content-Security-Policy: откуда странице можно загружать скрипты, картинки, фреймы и данные.
// 'unsafe-inline' для скриптов и стилей — Next.js и MUI вставляют небольшой встроенный код;
// строже (nonce для каждой страницы) — когда появится бэкенд и все страницы станут динамическими
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${sources.images.join(" ")}`,
  "font-src 'self' data:",
  // ws: — горячая перезагрузка в режиме разработки
  `connect-src 'self' ${sources.connect.join(" ")}${isDev ? " ws: wss:" : ""}`,
  `frame-src ${sources.frames.join(" ")}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // только HTTPS на год вперёд (действует, когда сайт работает на https с настоящим доменом)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // запрет показывать сайт во фрейме на чужих сайтах (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // браузер не угадывает тип файла — загруженное фото не исполнится как скрипт
  { key: "X-Content-Type-Options", value: "nosniff" },
  // другим сайтам — только домен, без полного адреса с фильтрами
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // из возможностей устройства нужна только геолокация («рядом со мной»)
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // не сообщать, что сайт на Next.js
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
