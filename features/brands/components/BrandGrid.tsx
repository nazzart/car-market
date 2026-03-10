import Image from "next/image";
import Tooltip from "@mui/material/Tooltip";

export default function BrandGrid() {
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
      <h2 className="text-2xl font-semibold mb-8">Популярные марки</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
        {brands.map((brand) => (
          <Tooltip key={brand.name} title={brand.name} arrow>
            <a
              href={`cars/${brand.url}`}
              className="
                h-20
                flex items-center justify-center
                bg-gray-50
                rounded-xl
                shadow-sm
                hover:shadow-md
                hover:bg-white
                transition
                cursor-pointer
              "
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                width={60}
                height={40}
                className="object-contain opacity-70 hover:opacity-100 transition"
              />
            </a>
          </Tooltip>
        ))}
      </div>
    </section>
  );
}
