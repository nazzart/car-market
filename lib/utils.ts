import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number) {
  return n.toLocaleString("ru-RU");
}

// "Baltic Auto" → "BA"
export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// 15 → «15 минут назад» / «pirms 15 minūtēm»; 1500 → «вчера» / «vakar»
export function formatAgo(minutes: number, locale: string) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (minutes < 60) return rtf.format(-minutes, "minute");
  if (minutes < 24 * 60) return rtf.format(-Math.round(minutes / 60), "hour");
  return rtf.format(-Math.round(minutes / (24 * 60)), "day");
}
