import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

import { useLocale, useTranslations } from "next-intl";

import MetaLine from "@/components/ui/MetaLine";
import Card from "@/components/ui/Card";
import { formatAgo, formatPrice } from "@/lib/utils";

import { Listing } from "@/features/cars/types";
import ListingPhone, { ContactPerson } from "./ListingPhone";
import SellerInfo from "./SellerInfo";
import ReportButton from "@/features/moderation/ReportButton";

type ContactCardProps = { listing: Listing };

// Цена + контакт продавца, «прилипает» к экрану на десктопе
export default function ContactCard({ listing }: ContactCardProps) {
  const t = useTranslations("listing");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <div>
      <Card padding="none" className="p-6 shadow-xl shadow-black/5">
        <div className="text-3xl font-bold tracking-tight text-gray-900">
          {formatPrice(listing.price)}
        </div>

        {listing.negotiable && (
          <div className="text-sm text-success mt-1">{t("negotiable")}</div>
        )}

        <ListingPhone listing={listing} variant="primary" className="w-full mt-5" />
        <ContactPerson listing={listing} className="mt-3 justify-center" />

        <div className="border-t border-gray-100 my-5" />

        <SellerInfo listing={listing} />

        <div className="flex gap-2 mt-5 p-3 rounded-xl bg-gray-50 text-xs text-gray-600 leading-relaxed">
          <ShieldOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-500 shrink-0" />
          {t("contact.safety")}
        </div>
      </Card>

      <MetaLine
        className="mt-3 px-2"
        items={[
          t("contact.listingNo", { id: listing.id }),
          formatAgo(listing.postedMinutesAgo, locale),
          listing.views ? tCommon("views", { count: listing.views }) : null,
        ]}
      />

      <ReportButton listingId={listing.id} className="mt-2 px-2" />
    </div>
  );
}
