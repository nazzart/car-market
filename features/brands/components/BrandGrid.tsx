import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { getListingStats } from "@/features/cars/api";
import { Link } from "@/i18n/navigation";

export default async function BrandGrid() {
  const [t, tCommon, { byBrand }] = await Promise.all([
    getTranslations("home.brands"),
    getTranslations("common"),
    getListingStats(),
  ]);
  const brandListingCount = (slug: string) => byBrand[slug] ?? 0;
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
    <section className="max-w-7xl mx-auto py-8 sm:py-10">
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-5 sm:mb-6">{t("popular")}</h2>

      <div className="flex md:grid md:grid-cols-5 lg:grid-cols-10 gap-3 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 snap-x scroll-px-4 scrollbar-none">
        {brands.map((brand) => (
          <Link
              key={brand.name}
              href={`/cars?brand=${brand.url}`}
              className="
                group
                shrink-0 w-24 md:w-auto
                h-28
                flex flex-col items-center justify-center gap-2
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
                className="object-contain h-9 w-auto opacity-60 group-hover:opacity-100 transition"
              />
              <span className="text-center leading-tight">
                <span className="block text-xs font-medium text-gray-900">{brand.name}</span>
                {brandListingCount(brand.url) > 0 && (
                  <span className="block text-[11px] text-gray-500 tabular-nums">
                    {tCommon("listings", { count: brandListingCount(brand.url) })}
                  </span>
                )}
              </span>
            </Link>
        ))}
      </div>
    </section>
  );
}
