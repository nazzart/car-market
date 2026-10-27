import Image from "next/image";
import Tooltip from "@mui/material/Tooltip";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export default function BrandGrid() {
  const t = useTranslations("home.brands");
  const brands = [
    { name: "BMW", logo: "/brands/bmw.svg", url: "bmw" },
    { name: "Toyota", logo: "/brands/toyota.svg", url: "toyota" },
    { name: "Mercedes", logo: "/brands/mercedes.svg", url: "mercedes" },
    { name: "Audi", logo: "/brands/audi.svg", url: "audi" },
    { name: "Volkswagen", logo: "/brands/volkswagen.svg", url: "volkswagen" },
    { name: "Hyundai", logo: "/brands/hyundai.svg", url: "hyundai" },
    { name: "Kia", logo: "/brands/kia.svg", url: "kia" },
    { name: "Ford", logo: "/brands/ford.svg", url: "ford" },
    { name: "Nissan", logo: "/brands/nissan.svg", url: "nissan" },
    { name: "Honda", logo: "/brands/honda.svg", url: "honda" },
  ];

  return (
    <section className="max-w-7xl mx-auto py-8">
      <h2 className="text-2xl font-semibold tracking-tight mb-6">{t("popular")}</h2>

      <div className="flex md:grid md:grid-cols-5 lg:grid-cols-10 gap-3 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 snap-x scroll-px-4 scrollbar-none">
        {brands.map((brand) => (
          <Tooltip key={brand.name} title={brand.name} arrow>
            <Link
              href={`/cars?brand=${brand.url}`}
              className="
                group
                shrink-0 w-24 md:w-auto
                h-20
                flex items-center justify-center
                bg-white
                border border-gray-200
                rounded-2xl
                snap-start
                hover:border-gray-300
                hover:shadow-lg hover:shadow-black/5
                hover:-translate-y-0.5
                transition duration-200
                cursor-pointer
              "
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                width={60}
                height={40}
                className="object-contain opacity-60 group-hover:opacity-100 transition"
              />
            </Link>
          </Tooltip>
        ))}
      </div>
    </section>
  );
}
