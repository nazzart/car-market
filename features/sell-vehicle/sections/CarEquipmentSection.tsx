"use client";

import { SectionContainer } from "../components/SectionContainer";
import { ChipSelect } from "@/components/ui/chip-select/ChipSelect";
import { FormStepProps } from "../types";
import { useSectionNext } from "../hooks/useSectionNext";
import { EquipmentGroup, equipmentGroups } from "@/features/cars/config/equipment";
import { useTranslations } from "next-intl";

export function CarEquipmentSection({
  id,
  title,
  data,
  required,
  onNext,
  updateField,
}: FormStepProps) {
  const tOptions = useTranslations("options");

  const isValid = !required;

  const { handleNext } = useSectionNext(isValid, required, onNext);

  return (
    <SectionContainer
      id={id}
      title={title}
      required={required}
      isValid={isValid}
      onNext={handleNext}
    >
      <div className="flex flex-col gap-6">
        {(Object.keys(equipmentGroups) as EquipmentGroup[]).map((key) => (
          <ChipSelect
            key={key}
            label={tOptions(`equipmentGroups.${key}`)}
            options={equipmentGroups[key].map((value) => ({ value, label: tOptions(`equipment.${value}`) }))}
            value={data[key]}
            onChange={(value) => updateField(key, value)}
            multiple
          />
        ))}
      </div>
    </SectionContainer>
  );
}
