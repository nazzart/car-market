"use client";

import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";

export function CarHistorySection({
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

  const { attemptedNext, handleNext } = useSectionNext(
    isValid,
    required,
    onNext
  );

  // генерация техосмотра
  const now = new Date();
  const inspectionOptions = [];

  for (let i = 0; i < 36; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    inspectionOptions.push({
      label: `${month} / ${year}`,
      value: `${year}-${month}`,
    });
  }

  return (
    <SectionContainer
      id={id}
      title={title}
      description="Основная информация о происхождении автомобиля"
      required={required}
      isValid={isValid}
      onNext={handleNext}
    >
      <div className="grid md:grid-cols-2 gap-4">
        {/* VIN */}

        <TextField
          label="VIN номер"
          value={data.vin ?? ""}
          onChange={(e) => updateField("vin", e.target.value.toUpperCase())}
          fullWidth
        />

        {/* Owners */}

        <FormControl fullWidth>
          <InputLabel>Количество владельцев</InputLabel>

          <Select
            value={data.owners ?? ""}
            label="Количество владельцев"
            onChange={(e) => updateField("owners", e.target.value)}
          >
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="4+">4+</MenuItem>
          </Select>
        </FormControl>

        {/* Mileage Latvia */}

        <FormControl fullWidth>
          <InputLabel>Пробег по Латвии</InputLabel>

          <Select
            value={data.mileageLatvia ?? ""}
            label="Пробег по Латвии"
            onChange={(e) => updateField("mileageLatvia", e.target.value)}
          >
            <MenuItem value="0">Без пробега по Латвии</MenuItem>
            <MenuItem value="10000">До 10 000 км</MenuItem>
            <MenuItem value="50000">10 000 – 50 000 км</MenuItem>
            <MenuItem value="100000">50 000 – 100 000 км</MenuItem>
            <MenuItem value="100000+">Более 100 000 км</MenuItem>
            <MenuItem value="unknown">Не знаю</MenuItem>
          </Select>
        </FormControl>

        {/* Inspection */}

        <FormControl fullWidth error={attemptedNext && !data.inspectionUntil}>
          <InputLabel>Техосмотр до</InputLabel>

          <Select
            value={data.inspectionUntil ?? ""}
            label="Техосмотр до"
            onChange={(e) => updateField("inspectionUntil", e.target.value)}
          >
            <MenuItem value="none">Нет</MenuItem>

            {inspectionOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </SectionContainer>
  );
}
