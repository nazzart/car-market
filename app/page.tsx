import Container from "@/components/layout/Container";
import BrandGrid from "@/features/brands/components/BrandGrid";
import BrandList from "@/features/brands/components/BrandList";
import CarGrid from "@/features/latest-cars/components/CarGrid";

export default function Home() {
  return (
    <Container>
      <BrandGrid />

      <BrandList />

      <CarGrid />
    </Container>
  );
}
