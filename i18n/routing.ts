import { defineRouting } from "next-intl/routing";

// Латышский — основной (без префикса: /cars), русский — /ru/cars
export const routing = defineRouting({
  locales: ["lv", "ru"],
  defaultLocale: "lv",
  localePrefix: "as-needed",
  // по умолчанию всегда латышский; язык меняется только переключателем
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
