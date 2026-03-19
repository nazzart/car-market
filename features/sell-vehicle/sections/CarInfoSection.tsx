"use client";

import { TextField, MenuItem, InputAdornment } from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";
import { ChipSelect } from "../../../components/ui/chip-select/ChipSelect";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";
import { useSectionValidation } from "../hooks/useSectionValidation";

export function CarInfoSection({
  id,
  title,
  data,
  required,
  fields,
  onNext,
  updateField,
}: FormStepProps) {
  const brands = ["Audi", "BMW", "Mercedes"];

  const bodyTypes = [
    { label: "Sedan", value: "sedan" },
    { label: "Wagon", value: "wagon" },
    { label: "Hatchback", value: "hatchback" },
    { label: "Coupe", value: "coupe" },
    { label: "Convertible", value: "convertible" },
    { label: "SUV", value: "suv" },
    { label: "Minivan", value: "minivan" },
    { label: "Pickup", value: "pickup" },
  ];

  const colors = [
    { label: "Чёрный", value: "black", color: "#111111" },
    { label: "Белый", value: "white", color: "#f5f5f5" },
    { label: "Серый", value: "gray", color: "#9ca3af" },
    { label: "Серебристый", value: "silver", color: "#cbd5e1" },
    { label: "Синий", value: "blue", color: "#2563eb" },
    { label: "Красный", value: "red", color: "#dc2626" },
    { label: "Бордовый", value: "burgundy", color: "#7f1d1d" },
    { label: "Зелёный", value: "green", color: "#16a34a" },
    { label: "Жёлтый", value: "yellow", color: "#eab308" },
    { label: "Оранжевый", value: "orange", color: "#ea580c" },
    { label: "Коричневый", value: "brown", color: "#92400e" },
    { label: "Бежевый", value: "beige", color: "#e8d3a7" },
    { label: "Фиолетовый", value: "purple", color: "#7c3aed" },
    { label: "Золотой", value: "gold", color: "#d4af37" },
  ];

  const { isValid } = useSectionValidation(fields, data);

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
      isValid={isValid}
      onNext={handleNext}
    >
      <div className="space-y-7">
        {/* Brand / Model */}

        <div className="grid md:grid-cols-2 gap-4">
          <TextField
            select
            label="Марка"
            required
            fullWidth
            value={data.brand ?? ""}
            onChange={(e) => updateField("brand", e.target.value)}
            error={attemptedNext && !data.brand}
          >
            {brands.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Модель"
            required
            placeholder="Например: A4"
            fullWidth
            value={data.model ?? ""}
            onChange={(e) => updateField("model", e.target.value)}
            error={attemptedNext && !data.model}
          />
        </div>

        {/* Year / Mileage */}

        <div className="grid md:grid-cols-2 gap-4">
          <TextField
            label="Год выпуска"
            type="number"
            required
            fullWidth
            value={data.year ?? ""}
            onChange={(e) => updateField("year", e.target.value)}
            error={attemptedNext && !data.year}
            inputProps={{ min: 0 }}
          />

          <TextField
            label="Пробег"
            type="number"
            required
            fullWidth
            value={data.mileage ?? ""}
            onChange={(e) => updateField("mileage", e.target.value)}
            error={attemptedNext && !data.mileage}
            InputProps={{
              endAdornment: <InputAdornment position="end">km</InputAdornment>,
            }}
            inputProps={{ min: 0 }}
          />
        </div>

        {/* Price / Negotiable */}

        <div className="grid md:grid-cols-2 gap-4">
          <TextField
            label="Цена"
            type="number"
            required
            fullWidth
            value={data.price ?? ""}
            onChange={(e) => updateField("price", e.target.value)}
            error={attemptedNext && !data.price}
            InputProps={{
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            }}
            inputProps={{ min: 0 }}
          />

          <TextField
            select
            label="Торг"
            fullWidth
            value={data.negotiable ?? ""}
            onChange={(e) => updateField("negotiable", e.target.value)}
          >
            <MenuItem value="yes">Возможен</MenuItem>
            <MenuItem value="no">Нет</MenuItem>
          </TextField>
        </div>

        {/* Body type */}

        <ChipSelect
          label="Тип кузова"
          options={bodyTypes}
          value={data.bodyType}
          onChange={(value) => updateField("bodyType", value)}
          clearable
          disableUnselect
          required
          error={attemptedNext && !data.bodyType}
        />

        {/* Color */}

        <ChipSelect
          label="Цвет"
          options={colors}
          value={data.color}
          onChange={(value) => updateField("color", value)}
          variant="color"
          disableUnselect
          required
          error={attemptedNext && !data.color}
        />
      </div>
    </SectionContainer>
  );
}
