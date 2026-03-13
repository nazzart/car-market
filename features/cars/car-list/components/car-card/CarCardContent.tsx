import { CarCardProps } from "./types";
import CarCardSpecs from "./CarCardSpecs";

export default function CarCardContent({
  title,
  price,
  year,
  mileage,
  engine,
  power,
  engineType,
  sellerType,
  location,
}: CarCardProps) {
  return (
    <div className="flex flex-col flex-1 gap-1">
      <h3 className="font-semibold text-lg sm:text-xl leading-tight transition hover:text-gray-700">
        {title}
      </h3>

      <div className="text-2xl font-bold text-gray-900">{price}</div>

      <CarCardSpecs
        year={year}
        mileage={mileage}
        engine={engine}
        power={power}
        engineType={engineType}
      />

      <div className="mt-auto text-sm text-gray-500">
        {sellerType === "dealer" ? (
          <span>
            <span className="font-semibold">Dealer</span> · {location}
          </span>
        ) : (
          <span>Private seller · {location}</span>
        )}
      </div>
    </div>
  );
}