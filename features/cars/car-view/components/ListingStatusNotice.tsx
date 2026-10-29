"use client";

import { useTranslations } from "next-intl";

import Notice, { noticeActionClass } from "@/components/ui/Notice";
import { VisibilitySubject, useVisibility } from "@/features/moderation/visibility";
import { Link } from "@/i18n/navigation";

// Плашка над объявлением: продавец скрыл / продал / удалил или модератор заблокировал
export default function ListingStatusNotice({ listing, brand }: { listing: VisibilitySubject; brand: string }) {
  const t = useTranslations("listing.status");
  const { of } = useVisibility();
  const { seller, moderation, pending, accountBlock } = of(listing);

  // решение модератора важнее статуса продавца
  const key = moderation
    ? moderation.status === "removed"
      ? "deleted"
      : "blocked"
    : accountBlock
      ? "blocked"
      : pending
        ? "pending"
        : seller;
  if (key === "active") return null;

  return (
    <Notice
      tone={key === "blocked" ? "danger" : "warning"}
      title={t(`${key}.title`)}
      action={
        <Link href={`/cars?brand=${brand}`} className={noticeActionClass}>
          {t("similar")}
        </Link>
      }
      className="mt-4"
    >
      {t(`${key}.text`)}
    </Notice>
  );
}
