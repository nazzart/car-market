const brands = [
  "Audi",
  "Acura",
  "Alfa Romeo",
  "BMW",
  "Bentley",
  "Bugatti",
  "Chevrolet",
  "Chrysler",
  "Citroen",
  "Ford",
  "Ferrari",
  "Fiat",
];

export default function BrandList() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold mb-10">Все марки</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-4 gap-x-10">
        {brands.map((brand) => (
          <div
            key={brand}
            className="
                text-gray-600
                hover:text-black
                cursor-pointer
                transition
              "
          >
            {brand}
          </div>
        ))}
      </div>
    </section>
  );
}
