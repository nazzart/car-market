import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

import { formatNumber, plural } from "@/lib/utils";

import { Listing } from "../../data/listings";
import ContactPhoneButton from "./ContactPhoneButton";
import SellerInfo from "./SellerInfo";

// Цена + контакт продавца, «прилипает» к экрану на десктопе
export default function ContactCard({ listing }: { listing: Listing }) {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 p-6 shadow-xl shadow-black/5">
        <div className="text-3xl font-bold tracking-tight text-gray-900">
          {formatNumber(listing.price)} €
        </div>

        {listing.negotiable && (
          <div className="text-sm text-emerald-700 mt-1">Торг возможен</div>
        )}

        <ContactPhoneButton phone={listing.phone} className="w-full mt-5" />

        <div className="border-t border-gray-100 my-5" />

        <SellerInfo listing={listing} />

        <div className="flex gap-2 mt-5 p-3 rounded-xl bg-gray-50 text-xs text-gray-600 leading-relaxed">
          <ShieldOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-500 shrink-0" />
          Не вносите предоплату до личного осмотра автомобиля и проверки документов.
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3 px-2">
        Объявление №{listing.id} · {listing.postedAt}
        {listing.views &&
          ` · ${formatNumber(listing.views)} ${plural(listing.views, [
            "просмотр",
            "просмотра",
            "просмотров",
          ])}`}
      </p>
    </div>
  );
}
