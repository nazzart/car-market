"use client";

import { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";

type Props = {
  onNext?: () => void;
  onValidChange?: (valid: boolean) => void;
};

export function CarHistorySection({ onNext, onValidChange }: Props) {
  const [vin, setVin] = useState("");
  const [owners, setOwners] = useState("");
  const [mileageLatvia, setMileageLatvia] = useState("");
  const [inspectionUntil, setInspectionUntil] = useState("");
  
  useEffect(() => {
    const valid = inspectionUntil

    onValidChange?.(Boolean(valid));
  }, [inspectionUntil]);

  // генерация техосмотра на 36 месяцев вперед
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
      id="history"
      title="История автомобиля"
      description="Основная информация о происхождении автомобиля"
      required
      isValid={Boolean(inspectionUntil)}

      onNext={onNext}
    >
      <div className="grid md:grid-cols-2 gap-4">
        {/* VIN */}

        <TextField
          label="VIN номер"
          value={vin}
          onChange={(e) => setVin(e.target.value.toUpperCase())}
          fullWidth
        />

        {/* Owners */}

        <FormControl fullWidth>
          <InputLabel>Количество владельцев</InputLabel>

          <Select
            value={owners}
            label="Количество владельцев"
            onChange={(e) => setOwners(e.target.value)}
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
            value={mileageLatvia}
            label="Пробег по Латвии"
            onChange={(e) => setMileageLatvia(e.target.value)}
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

        <FormControl fullWidth>
          <InputLabel>Техосмотр до</InputLabel>

          <Select
            value={inspectionUntil}
            label="Техосмотр до"
            onChange={(e) => setInspectionUntil(e.target.value)}
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
