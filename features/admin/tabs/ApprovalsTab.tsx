"use client";

import { useLocale, useTranslations } from "next-intl";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { RiskFlag, riskFlags } from "@/features/moderation/riskFlags";
import { BlockReason, approveListing } from "@/features/moderation/store";
import { Link } from "@/i18n/navigation";
import { formatAgo, formatNumber, formatPrice } from "@/lib/utils";

import { Thumb, useAdminData, useListingAdmin, useModerationDialog } from "../shared";

// Флаги, которые сами по себе — повод отклонить; остальные — просто подсказки
const SERIOUS: RiskFlag[] = ["contactInText", "priceLow", "duplicate"];

// Причина отклонения по умолчанию — по самому серьёзному флагу
const reasonFor = (flags: RiskFlag[]): BlockReason =>
  flags.includes("duplicate") ? "duplicate" : flags.includes("priceLow") ? "wrongPrice" : flags.includes("contactInText") ? "prohibited" : "wrongInfo";

// Премодерация: новые объявления не видны покупателям, пока модератор не одобрит
export default function ApprovalsTab() {
  const t = useTranslations("moderation.admin");
  const { listings, sellerOf } = useAdminData();
  const locale = useLocale();
  const { statusKey } = useListingAdmin();
  const { dialog, reject } = useModerationDialog();

  const pending = listings.filter((l) => statusKey(l.id) === "pending");

  if (pending.length === 0) return <EmptyState text={t("approvals.empty")} />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{t("approvals.hint")}</p>

      {pending.map((l) => {
        const flags = riskFlags(l, listings);

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
                  <span className="font-medium text-gray-900">{formatPrice(l.price)}</span> ·{" "}
                  {formatNumber(l.mileage)} km · {sellerOf(l, t("table.private"))} · {formatAgo(l.postedMinutesAgo, locale)}
                </div>

                {/* автоматические проверки */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {flags.length === 0 ? (
                    <Badge tone="success">{t("approvals.clean")}</Badge>
                  ) : (
                    flags.map((f) => (
                      <Badge
                        key={f}
                        tone={SERIOUS.includes(f) ? "danger" : "warning"}
                        icon={<WarningAmberIcon sx={{ fontSize: 13 }} />}
                      >
                        {t(`flags.${f}`)}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>

            {l.description && (
              <p className="mt-3 p-3 rounded-xl bg-gray-50 text-sm text-gray-700 leading-relaxed">{l.description}</p>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-3">
              <Button variant="dangerOutline" onClick={() => reject(l.id, l.title, reasonFor(flags))}>
                <CloseIcon sx={{ fontSize: 18 }} />
                {t("actions.reject")}
              </Button>
              <Button variant="dark" onClick={() => approveListing(l.id)}>
                <CheckIcon sx={{ fontSize: 18 }} />
                {t("actions.approve")}
              </Button>
            </div>
          </article>
        );
      })}

      {dialog}
    </div>
  );
}
