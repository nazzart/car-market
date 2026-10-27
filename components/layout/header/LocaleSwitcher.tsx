"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// LV / RU — остаёмся на той же странице и с теми же фильтрами
export default function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: string) => {
    if (next === locale) return;

    // query берём в момент клика — без useSearchParams в шапке
    router.replace(`${pathname}${window.location.search}`, { locale: next, scroll: false });
  };

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={`inline-flex p-0.5 rounded-full bg-gray-100 text-xs font-semibold ${className ?? ""}`}
    >
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === locale}
          onClick={() => switchTo(l)}
          className={`px-2.5 py-1 rounded-full uppercase transition cursor-pointer ${
            l === locale ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-black"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
