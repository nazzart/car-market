import Link from "next/link";

// value совпадает со значениями bodyType в форме продажи
const bodyTypes = [
  { label: "Седан", value: "sedan" },
  { label: "Внедорожник", value: "suv" },
  { label: "Универсал", value: "wagon" },
  { label: "Хэтчбек", value: "hatchback" },
  { label: "Минивэн", value: "minivan" },
  { label: "Купе", value: "coupe" },
  { label: "Кабриолет", value: "convertible" },
  { label: "Пикап", value: "pickup" },
];

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
  return (
    <section className="py-8 grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">По типу кузова</h2>

        <div className="flex flex-wrap gap-2">
          {bodyTypes.map((type) => (
            <Link
              key={type.value}
              href={`/cars?bodyType=${type.value}`}
              className={pillClass}
            >
              {type.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">По цене</h2>

        <div className="flex flex-wrap gap-2">
          {priceRanges.map((price) => (
            <Link
              key={price}
              href={`/cars?priceTo=${price}`}
              className={pillClass}
            >
              до {price.toLocaleString("ru-RU")} €
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
