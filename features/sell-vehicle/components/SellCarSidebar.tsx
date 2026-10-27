"use client";

import CheckIcon from "@mui/icons-material/Check";
import { useTranslations } from "next-intl";

type Props = {
  sections: {
    id: string;
    required?: boolean;
  }[];
  sectionsValid: Record<string, boolean>;
  visibleSections: string[];
  requiredDone: number;
  requiredTotal: number;
};

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;

  // отступ под «липкую» шапку сайта
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - 96,
    behavior: "smooth",
  });
};

function Progress({ done, total }: { done: number; total: number }) {
  const t = useTranslations("sell.form");

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-gray-900">{t("required")}</span>
        <span className="text-gray-500 tabular-nums">
          {t("progress", { done, total })}
        </span>
      </div>

      <div className="h-1.5 mt-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function SellCarSidebar({
  sections,
  sectionsValid,
  visibleSections,
  requiredDone,
  requiredTotal,
}: Props) {
  const t = useTranslations("sell");

  return (
    <>
      {/* Mobile: только прогресс */}

      <div className="lg:hidden p-4 rounded-2xl border border-gray-200">
        <Progress done={requiredDone} total={requiredTotal} />
      </div>

      {/* Desktop */}

      <aside className="hidden lg:block sticky top-24">
        <div className="p-5 rounded-2xl border border-gray-200">
          <Progress done={requiredDone} total={requiredTotal} />

          <ol className="mt-5 space-y-1 -mx-2">
            {sections.map((item, index) => {
              const valid = sectionsValid[item.id];
              const reached = visibleSections.includes(item.id);

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={!reached}
                    onClick={() => scrollToSection(item.id)}
                    className="flex items-center gap-3 w-full px-2 py-1.5 rounded-lg text-left transition enabled:hover:bg-gray-50 enabled:cursor-pointer disabled:cursor-default"
                  >
                    <span
                      className={`
                        w-6 h-6 shrink-0
                        flex items-center justify-center
                        rounded-full
                        text-xs font-semibold
                        transition
                        ${
                          valid
                            ? "bg-emerald-500 text-white"
                            : reached
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-400"
                        }
                      `}
                    >
                      {valid ? <CheckIcon sx={{ fontSize: 14 }} /> : index + 1}
                    </span>

                    <span
                      className={`text-sm ${reached ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {t(`sections.${item.id}`)}
                      {!item.required && (
                        <span className="text-gray-400"> · {t("form.optionalShort")}</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>
    </>
  );
}
