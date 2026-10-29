import { placeFromName } from "@/lib/places";

import type { AddressResult } from "./types";

export type { AddressResult };

// Адреса — из Государственного адресного регистра (VZD) через наш же API, без внешних геокодеров.
// Сервер: features/addresses/addressIndex.ts, данные: npm run addresses:build

async function get<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Addresses error ${res.status}`);
  return res.json();
}

// Подсказки по введённому тексту; near — текущая метка, чтобы ближние адреса шли первыми
export function searchAddress(query: string, near: { lat: number; lng: number }, signal?: AbortSignal) {
  const params = new URLSearchParams({ q: query, lat: String(near.lat), lng: String(near.lng) });
  return get<AddressResult[]>(`/api/addresses/search?${params}`, signal);
}

// Адрес по точке на карте; null — рядом адресов нет
export function reverseGeocode(lat: number, lng: number, signal?: AbortSignal) {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  return get<AddressResult | null>(`/api/addresses/reverse?${params}`, signal);
}

// «Brīvības iela 100, Rīga» → улица и город (ключ из списка или латышское название).
// Сельский адрес: «"Druvas 1", Gaiķi, Gaiķu pag., Saldus novads» → край — ключ "saldus-novads"
export function parseAddress(text: string) {
  const i = text.lastIndexOf(",");
  if (i === -1) return null;

  const street = text.slice(0, i).trim();
  const city = text.slice(i + 1).trim();
  if (!street || !city) return null;

  return { street, city: placeFromName(city) };
}
