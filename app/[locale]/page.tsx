import Container from "@/components/layout/Container";
import BrandGrid from "@/features/brands/components/BrandGrid";
import BrandList from "@/features/brands/components/BrandList";
import DealersTeaser from "@/features/home/components/DealersTeaser";
import WhyUs from "@/features/home/components/WhyUs";
import CarGrid from "@/features/latest-cars/components/CarGrid";
import QuickSearch from "@/features/search/components/QuickSearch";
import QuickLinks from "@/features/search/components/QuickLinks";
import SellBanner from "@/features/sell-vehicle/components/SellBanner";

export default function Home() {
  return (
    <>
      <Container>
        <QuickSearch />

        <CarGrid />

        <BrandGrid />
      </Container>

      {/* Серая полоса во всю ширину — разбивает однотипные белые секции */}
      <div className="bg-gray-50 border-y border-gray-100 mt-4 py-4">
        <Container className="bg-transparent">
          <BrandList />
        </Container>
      </div>

      <Container>
        <QuickLinks />

        <DealersTeaser />

        <WhyUs />

        <SellBanner />
      </Container>
    </>
  );
}
