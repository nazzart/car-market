"use client";

import { SellCarSidebar } from "./SellCarSidebar";

import { PhotosSection } from "../sections/PhotosSection";
import { CarInfoSection } from "../sections/CarInfoSection";
import { ConditionSection } from "../sections/ConditionSection";
import { ContactSection } from "../sections/ContactSection";

export function SellCarLayout() {
  return (
    <div className="max-w-[1100px] mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Sell your car</h1>

        <p className="text-gray-500">
          Fill the information below to publish your listing
        </p>
      </div>

      {/* IMPORTANT: items-start */}

      <div className="grid lg:grid-cols-[220px_1fr] gap-10 items-start">
        <SellCarSidebar />

        <div className="space-y-10">
          <PhotosSection />
          <CarInfoSection />
          <ConditionSection />
          <ContactSection />
        </div>
      </div>
    </div>
  );
}
