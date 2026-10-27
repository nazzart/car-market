import Container from "@/components/layout/Container";
import BrandGrid from "@/features/brands/components/BrandGrid";
import BrandList from "@/features/brands/components/BrandList";
import CarGrid from "@/features/latest-cars/components/CarGrid";
import QuickSearch from "@/features/search/components/QuickSearch";
import QuickLinks from "@/features/search/components/QuickLinks";
import SellBanner from "@/features/sell-vehicle/components/SellBanner";

export default function Home() {
  return (
    <Container>
      <QuickSearch />

      <BrandGrid />

      <BrandList />

      <CarGrid />

      <QuickLinks />

      <SellBanner />
    </Container>
  );
}
