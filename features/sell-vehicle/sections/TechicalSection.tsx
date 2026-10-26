"use client";

import { TextField, InputAdornment } from "@mui/material";
import { SectionContainer } from "../components/SectionContainer";
import { ChipSelect } from "../../../components/ui/chip-select/ChipSelect";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";
import { useSectionValidation } from "../hooks/useSectionValidation";
import { validateField } from "../utils/validationRules";

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
  const { isValid } = useSectionValidation(fields, data);

  const { attemptedNext, handleNext } = useSectionNext(
    isValid,
    required,
    onNext
  );

  const getRules = (name: string) => fields.find((f) => f.name === name)?.rules;

  return (
    <SectionContainer
      id={id}
      title={title}
      required={required}
      isValid={isValid}
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
            error={attemptedNext && !validateField(data.fuel, getRules("fuel"))}
            disableUnselect
            required
          />

          <div className="grid md:grid-cols-2 gap-4">
            <TextField
              label="Объём двигателя"
              value={data.engineCapacity ?? ""}
              onChange={(e) => {
                const value = e.target.value.replace(",", ".");
                updateField("engineCapacity", value);
              }}
              onBlur={() => {
                if (!data.engineCapacity) return;

                let value = data.engineCapacity.replace(",", ".");

                // если ввели "2" → "2.0"
                if (/^\d+$/.test(value)) {
                  value = value + ".0";
                }

                updateField("engineCapacity", value);
              }}
              error={
                attemptedNext &&
                !validateField(data.engineCapacity, getRules("engineCapacity"))
              }
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
              error={
                attemptedNext && !validateField(data.power, getRules("power"))
              }
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">HP</InputAdornment>
                ),
              }}
              inputProps={{ min: 0 }}
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
              required
              error={
                attemptedNext &&
                !validateField(data.transmission, getRules("transmission"))
              }
              disableUnselect
            />

            <ChipSelect
              label="Привод"
              options={DRIVES}
              value={data.drive}
              required
              onChange={(value) => updateField("drive", value)}
              error={
                attemptedNext && !validateField(data.drive, getRules("drive"))
              }
              disableUnselect
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
