import Container from "@/components/layout/Container";
import FiltersBar from "@/features/cars/car-list/components/filters/components/FiltersBar";
import CarCard from "@/features/cars/car-list/components/car-card/CarCard";

export default function CarsPage() {
  return (
    <>
      <Container>
        <FiltersBar />
      </Container>

      <Container className="px-0 sm:px-4 sm:w-full">
        <CarCard
          title="BMW X5, 2015"
          year={2021}
          mileage="38 тыс. км"
          engine="3.0 л"
          power="340 л.с."
          drive="Полный"
          engineType="Бензин"
          price="24500 €"
          sellerType="dealer"
          location="Москва"
          totalImages={20}
          images={[
            "/cars/bmw1.jpg",
            "/cars/bmw2.jpg",
            "/cars/bmw3.jpg",
            "/cars/bmw4.jpg",
            "/cars/bmw5.jpg",
          ]}
        />
        <CarCard
          title="Mercedes-Benz S430, 2006"
          year={2021}
          mileage="38 тыс. км"
          engine="3.0 л"
          power="340 л.с."
          drive="Полный"
          engineType="Бензин"
          price="45200 €"
          sellerType="private"
          location="Москва"
          totalImages={1}
          images={["/cars/bmw.jpg"]}
        />
        <CarCard
          title="Audi A4, 2021"
          year={2021}
          mileage="38 тыс. км"
          engine="3.0 л"
          engineType="Бензин"
          power="340 л.с."
          drive="Полный"
          price="15500 €"
          sellerType="private"
          location="Москва"
          totalImages={8}
          images={[
            "/cars/bmw1.jpg",
            "/cars/bmw2.jpg",
            "/cars/bmw3.jpg",
            "/cars/bmw4.jpg",
            "/cars/bmw5.jpg",
          ]}
        />
      </Container>
    </>
  );
}
