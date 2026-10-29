"use client";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { useTranslations } from "next-intl";

import Badge from "@/components/ui/Badge";
import type { User } from "@/features/auth/types";
import { brands } from "@/features/brands/data/brands";
import OpenStatus from "@/features/dealers/components/OpenStatus";
import { formatHours } from "@/features/dealers/lib/hours";
import type { Dealer } from "@/features/dealers/types";
import { Link } from "@/i18n/navigation";
import { usePlaceName } from "@/lib/places";

import { secondaryButton } from "./buttons";

// Боковая колонка кабинета: данные профиля, автосалон дилера, подсказка частному лицу
export default function AccountSidebar({
  user,
  dealer,
  shownCity,
}: {
  user: User;
  dealer: Dealer | null;
  shownCity: string | undefined;
}) {
  const t = useTranslations("account");
  const tOptions = useTranslations("options");
  const placeName = usePlaceName();
  const isDealer = user.type === "dealer";

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold mb-3">{isDealer ? t("profile.company") : t("profile.title")}</h3>

        <dl className="space-y-2 text-sm">
          {!isDealer && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">{t("profile.name")}</dt>
              <dd className="text-gray-900 text-right">{user.name}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">{t("profile.email")}</dt>
            <dd className="text-gray-900 text-right truncate">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">{t("profile.phone")}</dt>
            <dd className="text-gray-900 text-right">{user.phone || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">{t("profile.city")}</dt>
            <dd className="text-gray-900 text-right">{shownCity ? placeName(shownCity) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">{t("profile.since")}</dt>
            <dd className="text-gray-900 text-right">{user.since}</dd>
          </div>
        </dl>

        <Link href="/account/profile" className={`${secondaryButton} w-full mt-5`}>
          {t("profile.edit")}
        </Link>
      </div>

      {dealer?.address && (
        <div className="rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-3">{t("profile.dealerCenter")}</h3>

          <div className="space-y-2 text-sm text-gray-800">
            <div className="flex items-start gap-2">
              <PlaceOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-500" />
              {dealer.address}, {placeName(dealer.city)}
            </div>
            <div className="flex items-start gap-2">
              <ScheduleOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-500" />
              <div>
                <OpenStatus hours={dealer.hours} />
                <div className="text-xs text-gray-500">{formatHours(dealer.hours, (d) => tOptions(`days.${d}`))}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {dealer.brands.map((b) => (
              <Badge key={b}>{brands.find((brand) => brand.slug === b)?.name ?? b}</Badge>
            ))}
          </div>
        </div>
      )}

      {!isDealer && (
        <div className="flex gap-3 rounded-2xl bg-gray-50 p-5 text-sm text-gray-700">
          <MailOutlineIcon fontSize="small" className="text-gray-500 shrink-0" />
          {t("profile.tip")}
        </div>
      )}
    </aside>
  );
}
