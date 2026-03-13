"use client";

import CategoryCard from "../components/CategoryCard";

type Props = {
    onSelect: (category: string) => void;
  };

export default function CategoryView({ onSelect }: Props) {
  const items = [
    {
      title: "Cars",
      description: "Passenger vehicles",
      sub: "Sedans, SUVs, hatchbacks",
      image: "/cars/truck.png",
    },
    {
      title: "Commercial transport",
      description: "Trucks, vans, спецтехника",
      image: "/cars/truck.png",
    },
    {
      title: "Motorcycles",
      description: "Bikes, scooters",
      image: "/cars/truck.png",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-10 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-gray-500 text-lg">Create listing</p>

        <h1 className="text-4xl font-semibold mt-2">
          What do you want to sell?
        </h1>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <CategoryCard
            key={i}
            title={item.title}
            description={item.description}
            sub={item.sub}
            image={item.image}
            onClick={() => onSelect(item.title)}
          />
        ))}
      </div>
    </div>
  );
}