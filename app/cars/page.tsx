import Container from "@/components/layout/Container";
import FiltersBar from "@/features/cars/car-list/components/filters/components/FiltersBar";
import CarCard from "@/features/cars/car-list/components/card/CarCard";

export default function CarsPage() {
  return (
    <div>
      <FiltersBar />
      
      <CarCard
        title="BMW X5 xDrive40i (G05)"
        year={2021}
        mileage="38 тыс. км"
        engine="3.0 л"
        power="340 л.с."
        drive="Полный"
        engineType="Бензин"
        price="4 200 000 ₽"
        sellerType="dealer"
        rating={4.8}
        location="Москва"
        image="/cars/bmw.jpg"
      />
      <CarCard
        title="BMW X5 xDrive40i (G05)"
        year={2021}
        mileage="38 тыс. км"
        engine="3.0 л"
        power="340 л.с."
        drive="Полный"
        engineType="Бензин"
        price="4 200 000 ₽"
        sellerType="private"
        rating={4.8}
        location="Москва"
        image="/cars/bmw.jpg"
      />
      <CarCard
        title="BMW X5 xDrive40i (G05)"
        year={2021}
        mileage="38 тыс. км"
        engine="3.0 л"
        engineType="Бензин"
        power="340 л.с."
        drive="Полный"
        price="4 200 000 ₽"
        sellerType="private"
        rating={4.8}
        location="Москва"
        image="/cars/bmw.jpg"
      />
    </div>
  );
}
