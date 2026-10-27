import { formatNumber } from "@/lib/utils";

import { Listing } from "../../data/listings";
import ContactPhoneButton from "./ContactPhoneButton";

// Фиксированная панель внизу экрана на телефоне — цена и звонок всегда под рукой
export default function MobileContactBar({ listing }: { listing: Listing }) {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="text-lg font-bold text-gray-900 whitespace-nowrap">
            {formatNumber(listing.price)} €
          </div>
          {listing.negotiable && (
            <div className="text-xs text-emerald-700">Торг возможен</div>
          )}
        </div>

        <ContactPhoneButton phone={listing.phone} className="flex-1" />
      </div>
    </div>
  );
}
