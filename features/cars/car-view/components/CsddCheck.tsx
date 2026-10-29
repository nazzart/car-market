import { useTranslations } from "next-intl";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { buttonClass } from "@/components/ui/Button";

// Официальная бесплатная проверка: пробег на каждом техосмотре в Латвии (e-CSDD, нужен вход).
// Данные не подгружаем — покупатель сам вводит номер с фото или VIN
const CSDD_URL = "https://e.csdd.lv/tadati/";

export default function CsddCheck() {
  const t = useTranslations("listing.csdd");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-gray-200">
      <span className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        <FactCheckOutlinedIcon />
      </span>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900">{t("title")}</h3>
        <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{t("text")}</p>
      </div>

      <a
        href={CSDD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass({ variant: "outline" })}
      >
        {t("button")}
        <OpenInNewIcon sx={{ fontSize: 16 }} />
      </a>
    </div>
  );
}
