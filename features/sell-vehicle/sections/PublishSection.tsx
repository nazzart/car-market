"use client";

import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useTranslations } from "next-intl";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CarPhoto from "@/components/ui/CarPhoto";
import { listingTitle } from "@/features/cars/lib/version";
import { useBrandName } from "@/features/catalog/hooks";
import { usePlaceName } from "@/lib/places";
import { formatNumber, formatPrice } from "@/lib/utils";

import { SellFormData } from "../types";

type PublishSectionProps = {
  data: SellFormData;
  requiredDone: number;
  requiredTotal: number;
  onSubmit?: () => void;
};

// Итог перед публикацией: как объявление будет выглядеть в списке
export function PublishSection({ data, requiredDone, requiredTotal, onSubmit }: PublishSectionProps) {
  const t = useTranslations("sell.publish");
  const tCommon = useTranslations("common");
  const placeName = usePlaceName();

  const photos: string[] = data.photos ?? [];
  const brandName = useBrandName()(data.brand);
  const title = (data.model && listingTitle(brandName ?? "", data.model, data.version)) || t("yourCar");
  const complete = requiredDone === requiredTotal;

  return (
    <Card as="section" size="panel" id="publish" className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
      <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>

      {/* Preview */}

      <div className="flex gap-4 mt-6 p-3 rounded-card border border-gray-200">
        <CarPhoto src={photos[0]} alt="" sizes="160px" unoptimized className="w-32 sm:w-40 shrink-0 rounded-xl" />

        <div className="min-w-0 py-1">
          <div className="font-semibold text-gray-900 truncate">
            {title}
            {data.year && `, ${data.year}`}
          </div>

          <div className="text-xl font-bold mt-1">
            {data.price ? `${formatPrice(Number(data.price))}` : "— €"}
          </div>

          <div className="text-sm text-gray-500 mt-1">
            {[
              data.mileage && `${formatNumber(Number(data.mileage))} ${tCommon("units.km")}`,
              data.sellerCity && placeName(data.sellerCity),
              tCommon("photos", { count: photos.length }),
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
      </div>

      {!complete && (
        <div className="flex gap-3 mt-4 p-4 rounded-card bg-warning-soft text-sm text-warning-strong">
          <WarningAmberOutlinedIcon fontSize="small" className="text-warning-accent shrink-0" />
          {t("missing", { done: requiredDone, total: requiredTotal })}
        </div>
      )}

      <Button size="xl" fullWidth onClick={onSubmit} className="mt-6">
        {t("submit")}
      </Button>

      <p className="text-xs text-gray-500 text-center mt-3">
        {t("terms")}
      </p>
    </Card>
  );
}
