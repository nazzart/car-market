"use client";

import { useState } from "react";

import { SellCarSidebar } from "../components/SellCarSidebar";
import { useProgressiveSections } from "../hooks/useProgressiveSections";

import { PublishSection } from "../sections/PublishSection";
import { sections } from "../config/sectionsConfig";
import { getSectionsState } from "../utils/sectionUtils";
import { validateAndScroll } from "../lib/formSubmit";

export function SellCarView() {
  const { visibleSections, revealSection } = useProgressiveSections(sections);

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    bodyType: "",
    color: "",
    petrolType: "",
    engineCapacity: "",
    transmission: "",
    drive: "",
    power: "",
    vin: "",
    owners: "",
    mileageLatvia: "",
    inspectionUntil: "",
    condition: "",
    hadAccident: "",
    hasServiceDone: "",
    hasServiceBook: "",
    equipment: "",
    description: "",
    sellerName: "",
    sellerPhone: "",
    sellerEmail: "",
    sellerCity: "",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const sectionsState = getSectionsState(sections, formData);

  const handleSubmit = () => {
    const isOk = validateAndScroll(sections, formData);

    if (!isOk) return;

    console.log("SUBMIT", formData);
  };

  const lastSection = sections.at(-1);
  const isLastVisible = lastSection
    ? visibleSections.includes(lastSection.id)
    : false;

  return (
    <div className="max-w-[980px] mt-10">
      <div className="grid lg:grid-cols-[280px_1fr] gap-10 items-start">
        <SellCarSidebar sections={sections} sectionsValid={sectionsState} />

        <div className="space-y-10 pb-10">
          {sections.map((section, index) => {
            if (!visibleSections.includes(section.id)) return null;

            const Component = section.component;
            const nextSection = sections[index + 1];

            return (
              <Component
                key={section.id}
                id={section.id}
                title={section.title}
                data={formData}
                required={section.required}
                fields={section.fields}
                updateField={updateField}
                onNext={() => nextSection && revealSection(nextSection.id)}
              />
            );
          })}

          {isLastVisible && <PublishSection onSubmit={handleSubmit} />}

          {!isLastVisible && <div className="h-[50vh]" />}
        </div>
      </div>
    </div>
  );
}
