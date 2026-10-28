"use client";

import Image from "next/image";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useTranslations } from "next-intl";

import { cityLabel } from "@/lib/cities";
import { formatNumber } from "@/lib/utils";

import { SellFormData } from "../types";

type Props = {
  data: SellFormData;
  requiredDone: number;
  requiredTotal: number;
  onSubmit?: () => void;
};

// Итог перед публикацией: как объявление будет выглядеть в списке
export function PublishSection({ data, requiredDone, requiredTotal, onSubmit }: Props) {
  const t = useTranslations("sell.publish");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");

  const photos: string[] = data.photos ?? [];
  const title = [data.brand, data.model].filter(Boolean).join(" ") || t("yourCar");
  const complete = requiredDone === requiredTotal;

  return (
    <section
      id="publish"
      className="scroll-mt-24 bg-white rounded-3xl border border-gray-200 p-5 sm:p-8"
    >
      <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
      <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>

      {/* Preview */}

      <div className="flex gap-4 mt-6 p-3 rounded-2xl border border-gray-200">
        <div className="relative w-32 sm:w-40 aspect-[4/3] shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
          {photos[0] ? (
            <Image src={photos[0]} alt="" fill unoptimized className="object-cover" />
          ) : (
            <DirectionsCarOutlinedIcon sx={{ fontSize: 36 }} className="text-gray-300" />
          )}
        </div>

        <div className="min-w-0 py-1">
          <div className="font-semibold text-gray-900 truncate">
            {title}
            {data.year && `, ${data.year}`}
          </div>

          <div className="text-xl font-bold mt-1">
            {data.price ? `${formatNumber(Number(data.price))} €` : "— €"}
          </div>

          <div className="text-sm text-gray-500 mt-1">
            {[
              data.mileage && `${formatNumber(Number(data.mileage))} ${tCommon("units.km")}`,
              data.sellerCity && cityLabel(tOptions, data.sellerCity),
              tCommon("photos", { count: photos.length }),
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
      </div>

      {!complete && (
        <div className="flex gap-3 mt-4 p-4 rounded-2xl bg-amber-50 text-sm text-amber-900">
          <WarningAmberOutlinedIcon fontSize="small" className="text-amber-600 shrink-0" />
          {t("missing", { done: requiredDone, total: requiredTotal })}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        className="w-full h-14 mt-6 rounded-full bg-primary hover:bg-primary-hover text-white text-base font-semibold transition cursor-pointer"
      >
        {t("submit")}
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        {t("terms")}
      </p>
    </section>
  );
}
