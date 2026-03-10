export default function CarHeader() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Audi Q2 35 TFSI | Рестайлинг, 2022
      </h1>

      <div className="flex gap-2 mt-2">
        <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full">
          В наличии
        </span>

        <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
          Без ДТП
        </span>

        <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
          1 владелец
        </span>
      </div>
    </div>
  );
}
