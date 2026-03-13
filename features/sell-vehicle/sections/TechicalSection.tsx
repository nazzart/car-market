"use client";

import { useEffect, useState } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { SectionContainer } from "../components/SectionContainer";
import { ChipSelect } from "../../../components/ui/chip-select/ChipSelect";

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

type Props = {
  onNext: () => void;
  onValidChange?: (valid: boolean) => void;
};

export function TechnicalSection({ onNext, onValidChange }: Props) {
  const [fuel, setFuel] = useState<string | null>(null);
  const [transmission, setTransmission] = useState<string | null>(null);
  const [drive, setDrive] = useState<string | null>(null);

  useEffect(() => {
    const valid = fuel;

    onValidChange?.(Boolean(valid));
  }, [fuel]);

  return (
    <SectionContainer
      id="technical"
      title="Технические характеристики"
      isValid={Boolean(fuel)}
      required
      onNext={onNext}
    >
      <div className="space-y-7">
        {/* ENGINE */}

        <div className="space-y-4">
          <ChipSelect
            label="Тип топлива"
            options={FUEL_TYPES}
            value={fuel}
            onChange={setFuel}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <TextField
              label="Объём двигателя"
              type="number"
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">L</InputAdornment>,
              }}
            />

            <TextField
              label="Мощность"
              type="number"
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
              value={transmission}
              onChange={setTransmission}
            />

            <ChipSelect
              label="Привод"
              options={DRIVES}
              value={drive}
              onChange={setDrive}
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
