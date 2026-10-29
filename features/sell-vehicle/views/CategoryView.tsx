"use client";

import CheckIcon from "@mui/icons-material/Check";
import { useTranslations } from "next-intl";

import CategoryCard from "../components/CategoryCard";

type Props = {
  onSelect: (category: string) => void;
};

const items = [
  {
    value: "car",
    image: "/cars/category-car.png",
  },
  {
    value: "commercial",
    image: "/cars/category-truck.png",
    soon: true,
  },
  {
    value: "moto",
    image: "/cars/category-moto.png",
    soon: true,
  },
];

const benefits = ["free", "fast", "buyers"];

export default function CategoryView({ onSelect }: Props) {
  const t = useTranslations("sell.category");

  return (
    <div className="max-w-5xl mx-auto py-12 sm:py-20">
      {/* Header */}

      <div className="text-center mb-10 sm:mb-14">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {t("eyebrow")}
        </p>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-2">
          {t("title")}
        </h1>

        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-5 text-sm text-gray-600">
          {benefits.map((b) => (
            <li key={b} className="inline-flex items-center gap-1.5">
              <CheckIcon sx={{ fontSize: 16 }} className="text-success-accent" />
              {t(`benefits.${b}`)}
            </li>
          ))}
        </ul>
      </div>

      {/* Cards */}

      <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
        {items.map((item) => (
          <CategoryCard
            key={item.value}
            title={t(`${item.value}.title`)}
            description={t(`${item.value}.description`)}
            image={item.image}
            soon={item.soon}
            onClick={() => onSelect(item.value)}
          />
        ))}
      </div>
    </div>
  );
}
