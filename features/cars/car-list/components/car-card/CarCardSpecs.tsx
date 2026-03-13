type Props = {
    year: number;
    mileage: string;
    engine: string;
    power: string;
    engineType: string;
  };
  
  export default function CarCardSpecs({
    year,
    mileage,
    engine,
    power,
    engineType,
  }: Props) {
    return (
      <div className="text-[15px] text-gray-600 flex flex-wrap gap-x-2 sm:pt-4">
        <span>{year}</span>
        <span className="text-gray-400">/</span>
        <span>{mileage}</span>
        <span className="text-gray-400">/</span>
        <span>{engine}</span>
        <span className="text-gray-400">/</span>
        <span>{power}</span>
        <span className="text-gray-400">/</span>
        <span>{engineType}</span>
      </div>
    );
  }