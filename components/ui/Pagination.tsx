"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { Link } from "@/i18n/navigation";
import { withQuery } from "@/lib/url";
import { cn, formatNumber } from "@/lib/utils";

// Номера страниц: 1 … 5 [6] 7 … 20 — первая, последняя и соседние с текущей (помещается и на телефоне)
function pageNumbers(page: number, pageCount: number): (number | "gap")[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["gap" as const, p] : [p]));
}

const itemClass = "min-w-10 h-10 px-3 inline-flex items-center justify-center rounded-xl text-sm font-medium transition";

// Нумерация страниц списка (/cars, /dealers): остальные параметры URL сохраняются, меняется только ?page=.
// Обычные ссылки, а не кнопки: поисковики проходят по ним ко всем объявлениям и дилерам
export default function Pagination({
  path,
  page,
  pageCount,
  total,
  pageSize,
}: {
  path: "/cars" | "/dealers";
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
}) {
  const t = useTranslations("common.pagination");
  const params = useSearchParams();

  if (pageCount <= 1) return null;

  const href = (p: number) => withQuery(path, params, { page: p > 1 ? String(p) : null });

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const arrow = (target: number, label: string, icon: React.ReactNode, show: boolean) =>
    show ? (
      <Link href={href(target)} rel={target < page ? "prev" : "next"} aria-label={label} title={label}
        className={cn(itemClass, "text-gray-700 hover:bg-gray-100")}>
        {icon}
      </Link>
    ) : (
      <span aria-hidden className={cn(itemClass, "text-gray-300")}>
        {icon}
      </span>
    );

  return (
    <nav aria-label={t("label")} className="mt-10 flex flex-col items-center gap-3">
      <div className="flex items-center gap-1">
        {arrow(page - 1, t("previous"), <ChevronLeftIcon fontSize="small" />, page > 1)}

        {pageNumbers(page, pageCount).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="w-6 text-center text-gray-400">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={href(p)}
              aria-label={t("page", { page: p })}
              aria-current={p === page ? "page" : undefined}
              className={cn(itemClass, p === page ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100")}
            >
              {p}
            </Link>
          )
        )}

        {arrow(page + 1, t("next"), <ChevronRightIcon fontSize="small" />, page < pageCount)}
      </div>

      <p className="text-xs text-gray-500 tabular-nums">
        {t("range", { from: formatNumber(from), to: formatNumber(to), total: formatNumber(total) })}
      </p>
    </nav>
  );
}
