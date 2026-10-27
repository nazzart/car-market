import { useTranslations } from "next-intl";

import { bodyTypes as allBodyTypes } from "@/features/cars/config/filterOptions";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/utils";

// Порядок по популярности; значения — как в форме продажи
const bodyTypes = ["sedan", "suv", "wagon", "hatchback", "minivan", "coupe", "convertible", "pickup"].filter(
  (v) => allBodyTypes.includes(v)
);

const priceRanges = [3000, 5000, 10000, 15000, 20000, 30000];

const pillClass = `
  inline-flex items-center
  px-4 py-2
  rounded-full
  border border-gray-200
  text-sm text-gray-700
  hover:border-gray-900 hover:text-black
  transition
`;

export default function QuickLinks() {
  const t = useTranslations("home.quickLinks");
  const tOptions = useTranslations("options");

  return (
    <section className="py-8 grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">{t("byBody")}</h2>

        <div className="flex flex-wrap gap-2">
          {bodyTypes.map((type) => (
            <Link
              key={type}
              href={`/cars?bodyType=${type}`}
              className={pillClass}
            >
              {tOptions(`bodyType.${type}`)}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">{t("byPrice")}</h2>

        <div className="flex flex-wrap gap-2">
          {priceRanges.map((price) => (
            <Link
              key={price}
              href={`/cars?priceTo=${price}`}
              className={pillClass}
            >
              {t("upTo", { price: formatNumber(price) })}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
