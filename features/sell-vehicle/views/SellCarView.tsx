"use client";

import { CarInfoSection } from "../sections/CarInfoSection";
import { TechnicalSection } from "../sections/TechicalSection";
import { SellCarSidebar } from "../components/SellCarSidebar";
import { useProgressiveSections } from "../hooks/useProgressiveSections";
import { CarHistorySection } from "../sections/CarHistorySection";
import { CarConditionSection } from "../sections/CarConditionSection";
import { CarDescriptionSection } from "../sections/CarDescriptionSection";
import { ContactInfoSection } from "../sections/ContactSection";
import { PhotosSection } from "../sections/PhotosSection";
import { CarEquipmentSection } from "../sections/CarEquipmentSection";
import { PublishSection } from "../sections/PublishSection";

export function SellCarView() {
  const sections = [
    { id: "basic-info", component: CarInfoSection },
    { id: "technical", component: TechnicalSection },
    { id: "history", component: CarHistorySection },
    { id: "condition", component: CarConditionSection },
    { id: "equipment", component: CarEquipmentSection },
    { id: "description", component: CarDescriptionSection },
    { id: "contact", component: ContactInfoSection },
    { id: "photos", component: PhotosSection },
  ];

  const { visibleSections, sectionsValid, revealSection, setSectionValid } =
    useProgressiveSections(sections);

  return (
    <div className="max-w-[980px] mt-10">
      <div className="grid lg:grid-cols-[280px_1fr] gap-10 items-start">
        <SellCarSidebar sectionsValid={sectionsValid} />

        <div className="space-y-10 pb-10">
          {sections.map((section, index) => {
            const Component = section.component;

            if (!visibleSections.includes(section.id)) return null;

            const nextSection = sections[index + 1];

            return (
              <Component
                key={section.id}
                onNext={() => nextSection && revealSection(nextSection.id)}
                onValidChange={(valid: boolean) =>
                  setSectionValid(section.id, valid)
                }
              />
            );
          })}
          <PublishSection />
          <div className="h-[50vh]" />
        </div>
      </div>
    </div>
  );
}
