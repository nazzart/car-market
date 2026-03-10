import CarCharacteristics from "@/features/cars/car-view/components/CarCharacteristics";
import CarDescription from "@/features/cars/car-view/components/CarDescription";
import CarGallery from "@/features/cars/car-view/components/CarGallery";
import CarHeader from "@/features/cars/car-view/components/CarHeader";
import CarKeySpecs from "@/features/cars/car-view/components/CarKeySpecs";
import CarSpecsIcons from "@/features/cars/car-view/components/CarSpecsIcons";
import PriceCard from "@/features/cars/car-view/components/PriceCard";
import SellerCard from "@/features/cars/car-view/components/SellerCard";

export default function CarPage() {
  return (
    <div className="py-6">
      {/* breadcrumbs */}
      <div className="text-sm text-gray-500 mb-4">Главная / Audi / Q2</div>

      {/* title */}
      <CarHeader />

      {/* main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-10">
          <CarGallery />

          <CarKeySpecs />

            <CarCharacteristics />
            <CarDescription />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6 lg:sticky lg:top-6 h-fit">
          <PriceCard />

          <SellerCard />
        </div>
      </div>
    </div>
  );
}
