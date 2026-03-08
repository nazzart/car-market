import CarCard from "./CarCard";

export default function CarGrid() {
  return (
    <section className="max-w-[1200px] mx-auto py-6 px-4">
      <h2 className="text-2xl font-semibold mb-4">Рекомендации</h2>

      <div className="grid grid-cols-4 gap-4">
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
