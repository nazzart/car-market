import { useTranslations } from "next-intl";

import { formatPrice } from "@/lib/utils";

import { Listing } from "@/features/cars/types";
import ListingPhone from "./ListingPhone";

type MobileContactBarProps = { listing: Listing };

// Фиксированная панель внизу экрана на телефоне — цена и звонок всегда под рукой
export default function MobileContactBar({ listing }: MobileContactBarProps) {
  const t = useTranslations("listing");

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="text-lg font-bold text-gray-900 whitespace-nowrap">
            {formatPrice(listing.price)}
          </div>
          {listing.negotiable && (
            <div className="text-xs text-success">{t("negotiable")}</div>
          )}
        </div>

        <ListingPhone listing={listing} variant="primary" className="flex-1" />
      </div>
    </div>
  );
}
