import Container from "@/components/layout/Container";
import Header from "@/components/layout/Header";
import BrandGrid from "@/features/brands/components/BrandGrid";
import BrandList from "@/features/brands/components/BrandList";
import CarGrid from "@/features/latest-cars/components/CarGrid";

export default function Home() {
  return (
    <Container>
      <Header />

      <BrandGrid />

      <BrandList />

      <CarGrid />
    </Container>
  );
}
