"use client";

import { useEffect, useState } from "react";
import { TextField, MenuItem, Chip, InputAdornment } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { SectionContainer } from "../components/SectionContainer";
import { ChipSelect } from "../../../components/ui/chip-select/ChipSelect";

type Props = {
  onNext: () => void;
  onValidChange?: (valid: boolean) => void;
};

export function CarInfoSection({ onNext, onValidChange }: Props) {
  const [bodyType, setBodyType] = useState(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [color, setColor] = useState<string | null>(null);

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

  useEffect(() => {
    const valid = color;

    onValidChange?.(Boolean(valid));
  }, [color]);

  return (
    <SectionContainer
      id="basic-info"
      title="Основная информация"
      required
      isValid={Boolean(color)}
      onNext={onNext}
    >
      <div className="space-y-7">
        {/* Brand / Model */}

        <div className="grid md:grid-cols-2 gap-4">
          <TextField select label="Марка" required fullWidth>
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
          />
        </div>

        {/* Year / Mileage */}

        <div className="grid md:grid-cols-2 gap-4">
          <TextField
            label="Год выпуска"
            type="number"
            required
            fullWidth
            inputProps={{
              min: 1950,
              max: new Date().getFullYear(),
            }}
          />

          <TextField
            label="Пробег"
            type="number"
            required
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">km</InputAdornment>,
            }}
          />
        </div>

        {/* Price / Negotiable */}

        <div className="grid md:grid-cols-2 gap-4">
          <TextField
            label="Цена"
            type="number"
            required
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            }}
          />

          <TextField select label="Торг" fullWidth>
            <MenuItem value="yes">Возможен</MenuItem>
            <MenuItem value="no">Нет</MenuItem>
          </TextField>
        </div>

        {/* Body type */}

        <ChipSelect
          label="Тип кузова"
          options={bodyTypes}
          value={bodyType}
          onChange={setBodyType}
          clearable={false}
          disableUnselect
        />

        <ChipSelect
          label="Цвет"
          options={colors}
          value={color}
          onChange={setColor}
          variant="color"
          clearable={false}
          disableUnselect
        />
      </div>
    </SectionContainer>
  );
}
