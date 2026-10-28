"use client";

import { useLocale, useTranslations } from "next-intl";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { listings } from "@/features/cars/data/listings";
import { RiskFlag, riskFlags } from "@/features/moderation/riskFlags";
import { BlockReason, approveListing } from "@/features/moderation/store";
import { Link } from "@/i18n/navigation";
import { cn, formatAgo, formatNumber } from "@/lib/utils";

import { EmptyBox, Thumb, sellerOf, useListingAdmin, useModerationDialog } from "../shared";

// Флаги, которые сами по себе — повод отклонить; остальные — просто подсказки
const SERIOUS: RiskFlag[] = ["contactInText", "priceLow", "duplicate"];

// Причина отклонения по умолчанию — по самому серьёзному флагу
const reasonFor = (flags: RiskFlag[]): BlockReason =>
  flags.includes("duplicate") ? "duplicate" : flags.includes("priceLow") ? "wrongPrice" : flags.includes("contactInText") ? "prohibited" : "wrongInfo";

// Премодерация: новые объявления не видны покупателям, пока модератор не одобрит
export default function ApprovalsTab() {
  const t = useTranslations("moderation.admin");
  const locale = useLocale();
  const { statusKey } = useListingAdmin();
  const { dialog, reject } = useModerationDialog();

  const pending = listings.filter((l) => statusKey(l.id) === "pending");

  if (pending.length === 0) return <EmptyBox>{t("approvals.empty")}</EmptyBox>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{t("approvals.hint")}</p>

      {pending.map((l) => {
        const flags = riskFlags(l);

        return (
          <article key={l.id} className="rounded-2xl border border-gray-200 p-4">
            <div className="flex gap-3 sm:gap-4">
              <Thumb listing={l} />

              <div className="flex-1 min-w-0">
                <Link
                  href={`/listing/${l.id}`}
                  target="_blank"
                  className="font-semibold text-gray-900 hover:underline underline-offset-4"
                >
                  {l.title}, {l.year}
                </Link>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{formatNumber(l.price)} €</span> ·{" "}
                  {formatNumber(l.mileage)} km · {sellerOf(l, t("table.private"))} · {formatAgo(l.postedMinutesAgo, locale)}
                </div>

                {/* автоматические проверки */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {flags.length === 0 ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                      {t("approvals.clean")}
                    </span>
                  ) : (
                    flags.map((f) => (
                      <span
                        key={f}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                          SERIOUS.includes(f) ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"
                        )}
                      >
                        <WarningAmberIcon sx={{ fontSize: 13 }} />
                        {t(`flags.${f}`)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {l.description && (
              <p className="mt-3 p-3 rounded-xl bg-gray-50 text-sm text-gray-700 leading-relaxed">{l.description}</p>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => reject(l.id, l.title, reasonFor(flags))}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border border-gray-200 hover:border-red-600 hover:text-red-700 text-sm font-medium transition cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
                {t("actions.reject")}
              </button>
              <button
                type="button"
                onClick={() => approveListing(l.id)}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-semibold transition cursor-pointer"
              >
                <CheckIcon sx={{ fontSize: 18 }} />
                {t("actions.approve")}
              </button>
            </div>
          </article>
        );
      })}

      {dialog}
    </div>
  );
}
