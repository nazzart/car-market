export default function CarDetails() {
  const specs = [
    { label: "Владельцев", value: "1" },
    { label: "Цвет", value: "Чёрный" },
    { label: "Руль", value: "Левый" },
    { label: "VIN", value: "WAUZ********" },
    { label: "Обмен", value: "Возможен" },
  ];

  return (
    <section className="bg-gray-50 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Характеристики</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-3">
        {specs.map((spec) => (
          <div key={spec.label} className="flex justify-between">
            <span className="text-gray-500">{spec.label}</span>
            <span className="font-medium">{spec.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
