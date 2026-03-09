import Image from "next/image";
import Tooltip from "@mui/material/Tooltip";

export default function BrandGrid() {
  const brands = [
    { name: "BMW", logo: "/brands/bmw.svg" },
    { name: "Toyota", logo: "/brands/toyota.svg" },
    { name: "Mercedes", logo: "/brands/mercedes.svg" },
    { name: "Audi", logo: "/brands/audi.svg" },
    { name: "Volkswagen", logo: "/brands/volkswagen.svg" },
    { name: "Hyundai", logo: "/brands/hyundai.svg" },
    { name: "Kia", logo: "/brands/kia.svg" },
    { name: "Ford", logo: "/brands/ford.svg" },
    { name: "Nissan", logo: "/brands/nissan.svg" },
    { name: "Honda", logo: "/brands/honda.svg" },
  ];

  return (
    <section className="max-w-7xl mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-8">Популярные марки</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
        {brands.map((brand) => (
          <Tooltip key={brand.name} title={brand.name} arrow>
            <div
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
            </div>
          </Tooltip>
        ))}
      </div>
    </section>
  );
}
