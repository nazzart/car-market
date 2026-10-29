"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { DAYS, OpeningHours } from "@/features/dealers/types";
import { useNow } from "@/lib/useNow";

import { getOpenStatus, rigaNow } from "../lib/openStatus";

const trim = (time: string) => time.replace(/^0(\d)/, "$1");

// «● Открыто до 19:00» / «● Закрыто · откроется завтра в 9:00»
export default function OpenStatus({ hours, className }: { hours: OpeningHours; className?: string }) {
  const t = useTranslations("dealers.status");
  const tOptions = useTranslations("options");
  const now = useNow();

  // до гидратации — место под строку, чтобы карточка не прыгала
  if (now === null) return <span className={cn("inline-block h-5", className)} />;

  const status = getOpenStatus(hours, now);

  let text: string;
  if (status.open) text = t("openUntil", { time: trim(status.until) });
  else if (!status.next) text = t("closed");
  else {
    const { day, time, inDays } = status.next;
    const opens =
      inDays === 0
        ? t("opensToday", { time: trim(time) })
        : inDays === 1
          ? t("opensTomorrow", { time: trim(time) })
          : t("opensOn", { day: tOptions(`days.${day}`), time: trim(time) });
    text = `${t("closed")} · ${opens}`;
  }

  return (
    <span className={cn("inline-flex items-baseline gap-1.5 text-sm", className)}>
      <span className={cn("w-2 h-2 rounded-full shrink-0 self-start mt-[0.4em]", status.open ? "bg-success-solid" : "bg-gray-300")} />
      <span className={status.open ? "text-success font-medium" : "text-gray-600"}>{text}</span>
    </span>
  );
}

// Расписание на неделю, сегодняшний день выделен
export function WeekHours({ hours }: { hours: OpeningHours }) {
  const t = useTranslations("dealers.status");
  const tOptions = useTranslations("options");
  const now = useNow();
  const today = now === null ? null : rigaNow(now).day;

  return (
    <ul className="space-y-1 text-sm">
      {DAYS.map((day) => {
        const h = hours[day];
        const isToday = day === today;

        return (
          <li
            key={day}
            className={cn(
              "flex justify-between gap-4 px-2 py-1 -mx-2 rounded-lg",
              isToday ? "bg-gray-100 font-semibold text-gray-900" : "text-gray-700"
            )}
          >
            <span>{tOptions(`daysFull.${day}`)}</span>
            <span className={h ? "" : "text-gray-400"}>
              {h ? `${trim(h.open)}–${trim(h.close)}` : t("dayOff")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
