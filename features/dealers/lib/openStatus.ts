import { useSyncExternalStore } from "react";

import { DAYS, Day, OpeningHours } from "../data/dealers";

// Часы дилеров — по времени Риги, независимо от часового пояса посетителя
const rigaClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Riga",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function rigaNow(timestamp: number) {
  const parts = Object.fromEntries(rigaClock.formatToParts(timestamp).map((p) => [p.type, p.value]));
  return {
    day: parts.weekday.toLowerCase() as Day, // «Mon» → «mon»
    time: `${parts.hour}:${parts.minute}`,
  };
}

export type OpenStatus =
  | { open: true; until: string }
  | { open: false; next?: { day: Day; time: string; inDays: number } };

export function getOpenStatus(hours: OpeningHours, timestamp: number): OpenStatus {
  const { day, time } = rigaNow(timestamp);
  const today = hours[day];

  if (today && time >= today.open && time < today.close) return { open: true, until: today.close };
  if (today && time < today.open) return { open: false, next: { day, time: today.open, inDays: 0 } };

  // ищем ближайший рабочий день
  const start = DAYS.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const next = DAYS[(start + i) % 7];
    if (hours[next]) return { open: false, next: { day: next, time: hours[next]!.open, inDays: i } };
  }

  return { open: false };
}

// Текущая минута. На сервере — null: статус «открыто» считаем только в браузере,
// иначе разметка сервера и клиента разойдётся
const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
};
const getMinute = () => Math.floor(Date.now() / 60_000) * 60_000;

export const useNow = () => useSyncExternalStore(subscribe, getMinute, () => null);
