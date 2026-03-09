import CarCard from "./CarCard";

export default function CarGrid() {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-semibold mb-4">Рекомендации</h2>

      <div className="grid
    grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
    gap-4">
        <CarCard />
        <CarCard />
        <CarCard />
        <CarCard />
        <CarCard />
        <CarCard />
        <CarCard />
        <CarCard />
      </div>
    </section>
  );
}
