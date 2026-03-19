"use client";

import { TextField, InputAdornment } from "@mui/material";
import { SectionContainer } from "../components/SectionContainer";
import { ChipSelect } from "../../../components/ui/chip-select/ChipSelect";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";

const FUEL_TYPES = [
  { label: "Бензин", value: "petrol" },
  { label: "Дизель", value: "diesel" },
  { label: "Гибрид", value: "hybrid" },
  { label: "Электро", value: "electric" },
  { label: "Газ", value: "gas" },
];

const TRANSMISSIONS = [
  { label: "Механика", value: "manual" },
  { label: "Автомат", value: "automatic" },
  { label: "DSG", value: "dsg" },
  { label: "CVT", value: "cvt" },
];

const DRIVES = [
  { label: "Передний", value: "fwd" },
  { label: "Задний", value: "rwd" },
  { label: "Полный", value: "awd" },
];

export function TechnicalSection({
  id,
  title,
  data,
  required,
  fields,
  onNext,
  updateField,
}: FormStepProps) {
  const validFields = fields.every((f) => {
    const v = data[f];
    return typeof v === "string" ? v.trim() !== "" : Boolean(v);
  });

  const isValidEngine = /^[0-9]+(\.[0-9]{1,2})?$/.test(data.engineCapacity);

  const isValid = isValidEngine && validFields;

  const { attemptedNext, handleNext } = useSectionNext(
    isValid,
    required,
    onNext
  );

  return (
    <SectionContainer
      id={id}
      title={title}
      required={required}
      isValid={isValid && isValidEngine}
      onNext={handleNext}
    >
      <div className="space-y-7">
        {/* ENGINE */}

        <div className="space-y-4">
          <ChipSelect
            label="Тип топлива"
            options={FUEL_TYPES}
            value={data.fuel}
            onChange={(value) => updateField("fuel", value)}
            error={attemptedNext && !data.fuel}
            disableUnselect
          />

          <div className="grid md:grid-cols-2 gap-4">
            <TextField
              label="Объём двигателя"
              value={data.engineCapacity ?? ""}
              onChange={(e) => {
                const value = e.target.value.replace(",", ".");
                updateField("engineCapacity", value);
              }}
              error={attemptedNext && (!data.engineCapacity || !isValidEngine)}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">L</InputAdornment>,
              }}
            />

            <TextField
              label="Мощность"
              type="number"
              value={data.power ?? ""}
              onChange={(e) => updateField("power", e.target.value)}
              error={attemptedNext && !data.power}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">HP</InputAdornment>
                ),
              }}
            />
          </div>
        </div>

        {/* TRANSMISSION */}

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <ChipSelect
              label="Коробка передач"
              options={TRANSMISSIONS}
              value={data.transmission}
              onChange={(value) => updateField("transmission", value)}
              error={attemptedNext && !data.transmission}
              disableUnselect
            />

            <ChipSelect
              label="Привод"
              options={DRIVES}
              value={data.drive}
              onChange={(value) => updateField("drive", value)}
              error={attemptedNext && !data.drive}
              disableUnselect
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
