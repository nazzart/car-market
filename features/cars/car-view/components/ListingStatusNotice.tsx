"use client";

import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import Notice from "@/components/ui/Notice";
import { VisibilitySubject, useVisibility } from "@/features/moderation/visibility";

type ListingStatusNoticeProps = { listing: VisibilitySubject; brand: string };

// Плашка над объявлением: продавец скрыл / продал / удалил или модератор заблокировал
export default function ListingStatusNotice({ listing, brand }: ListingStatusNoticeProps) {
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
        <Button variant="outline" size="sm" href={`/cars?brand=${brand}`}>
          {t("similar")}
        </Button>
      }
      className="mt-4"
    >
      {t(`${key}.text`)}
    </Notice>
  );
}
