"use client";

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";
import { CarDamageSelector } from "./CarDamageSelector";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";

export function CarConditionSection({
  id,
  title,
  data,
  required,
  fields,
  onNext,
  updateField,
}: FormStepProps) {
  const isValid = fields.every((f) => {
    const v = data[f];
    return typeof v === "string" ? v.trim() !== "" : Boolean(v);
  });

  const { handleNext } = useSectionNext(isValid, required, onNext);

  return (
    <SectionContainer
      id={id}
      title={title}
      description="Информация о текущем состоянии автомобиля"
      required={required}
      isValid={isValid}
      onNext={handleNext}
    >
      <div className="grid md:grid-cols-2 gap-4">
        {/* General condition */}

        <FormControl fullWidth>
          <InputLabel>Общее состояние</InputLabel>

          <Select
            value={data.condition ?? ""}
            label="Общее состояние"
            onChange={(e) => updateField("condition", e.target.value)}
          >
            <MenuItem value="excellent">Отличное</MenuItem>
            <MenuItem value="good">Хорошее</MenuItem>
            <MenuItem value="average">Среднее</MenuItem>
            <MenuItem value="repair">Требует ремонта</MenuItem>
          </Select>
        </FormControl>

        {/* Accident */}

        <FormControl fullWidth>
          <InputLabel>Была в ДТП</InputLabel>

          <Select
            value={data.hadAccident}
            label="Была в ДТП"
            onChange={(e) => updateField("hadAccident", e.target.value)}
          >
            <MenuItem value="no">Нет</MenuItem>
            <MenuItem value="yes">Да</MenuItem>
            <MenuItem value="unknown">Не знаю</MenuItem>
          </Select>
        </FormControl>

        {/* Service done */}

        <FormControl fullWidth>
          <InputLabel>Сделано обслуживание</InputLabel>

          <Select
            value={data.hasServiceDone}
            label="Сделано обслуживание"
            onChange={(e) => updateField("hasServiceDone", e.target.value)}
          >
            <MenuItem value="recent">Недавно обслуживалась</MenuItem>
            <MenuItem value="partial">Частично обслужена</MenuItem>
            <MenuItem value="required">Требуется обслуживание</MenuItem>
          </Select>
        </FormControl>

        {/* Service book */}

        <FormControl fullWidth>
          <InputLabel>Сервисная книжка</InputLabel>

          <Select
            value={data.hasServiceBook}
            label="Сервисная книжка"
            onChange={(e) => updateField("hasServiceBook", e.target.value)}
          >
            <MenuItem value="yes">Есть</MenuItem>
            <MenuItem value="no">Нет</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="space-y-6">
        <CarDamageSelector />
      </div>
    </SectionContainer>
  );
}
