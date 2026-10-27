"use client";

import { Switch } from "@mui/material";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { useTranslations } from "next-intl";

import { inputClass } from "@/features/cars/car-list/components/ui";
import { cn } from "@/lib/utils";
import { DAYS, Day, OpeningHours, formatHours } from "@/features/dealers/data/dealers";

const DEFAULT_HOURS = { open: "09:00", close: "18:00" };
const WEEKDAYS: Day[] = ["tue", "wed", "thu", "fri"];

// Время «HH:MM» сравнивается как строка
export const hoursInvalid = (hours: OpeningHours) =>
  DAYS.some((d) => hours[d] && hours[d]!.close <= hours[d]!.open);

type Props = {
  value: OpeningHours;
  onChange: (value: OpeningHours) => void;
};

export default function HoursEditor({ value, onChange }: Props) {
  const t = useTranslations("account.settings.hours");
  const tOptions = useTranslations("options");

  const setDay = (day: Day, hours: OpeningHours[Day]) => {
    const next = { ...value };
    if (hours) next[day] = hours;
    else delete next[day];
    onChange(next);
  };

  const copyMondayToWeekdays = () => {
    if (!value.mon) return;
    const next = { ...value };
    for (const d of WEEKDAYS) next[d] = { ...value.mon };
    onChange(next);
  };

  const preview = formatHours(value, (d) => tOptions(`days.${d}`));

  return (
    <div>
      <ul className="divide-y divide-gray-100">
        {DAYS.map((day) => {
          const hours = value[day];
          const invalid = hours && hours.close <= hours.open;

          return (
            <li key={day} className="py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2 w-44">
                <Switch
                  checked={Boolean(hours)}
                  onChange={(e) => setDay(day, e.target.checked ? { ...DEFAULT_HOURS } : undefined)}
                  slotProps={{ input: { "aria-label": tOptions(`daysFull.${day}`) } }}
                />
                <span className={`font-medium ${hours ? "text-gray-900" : "text-gray-400"}`}>
                  {tOptions(`daysFull.${day}`)}
                </span>
              </div>

              {hours ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    aria-label={t("openLabel")}
                    value={hours.open}
                    onChange={(e) => setDay(day, { ...hours, open: e.target.value })}
                    className={cn(inputClass, "w-28", invalid && "border-error")}
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="time"
                    aria-label={t("closeLabel")}
                    value={hours.close}
                    onChange={(e) => setDay(day, { ...hours, close: e.target.value })}
                    className={cn(inputClass, "w-28", invalid && "border-error")}
                  />

                  {day === "mon" && (
                    <button
                      type="button"
                      onClick={copyMondayToWeekdays}
                      className="ml-1 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black whitespace-nowrap cursor-pointer"
                    >
                      <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                      {t("copy")}
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-400">{t("closed")}</span>
              )}

              {invalid && <p className="w-full text-xs text-error sm:pl-48">{t("invalid")}</p>}
            </li>
          );
        })}
      </ul>

      {/* Превью — так часы покажутся на странице дилера */}
      <div className="mt-4 p-4 rounded-2xl bg-gray-50 text-sm">
        <span className="text-gray-500">{t("preview")} </span>
        <span className="font-medium text-gray-900">{preview || t("allClosed")}</span>
      </div>
    </div>
  );
}
