"use client";

import { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";
import { CarDamageSelector } from "./CarDamageSelector";

type Props = {
  onNext?: () => void;
  onValidChange?: (valid: boolean) => void;
};

export function CarConditionSection({ onNext, onValidChange }: Props) {
  const [condition, setCondition] = useState("");
  const [accident, setAccident] = useState("");
  const [serviceDone, setServiceDone] = useState("");
  const [serviceBook, setServiceBook] = useState("");
  const [damages, setDamages] = useState("");
  const [damageDescription, setDamageDescription] = useState("");

  const isValid = condition !== "" && accident !== "";
  
  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  return (
    <SectionContainer
      id="condition"
      title="Состояние автомобиля"
      description="Информация о текущем состоянии автомобиля"
      required={false}
      isValid={isValid}
      onNext={onNext}
    >
      <div className="grid md:grid-cols-2 gap-4">
        {/* General condition */}

        <FormControl fullWidth>
          <InputLabel>Общее состояние</InputLabel>

          <Select
            value={condition}
            label="Общее состояние"
            onChange={(e) => setCondition(e.target.value)}
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
            value={accident}
            label="Была в ДТП"
            onChange={(e) => setAccident(e.target.value)}
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
            value={serviceDone}
            label="Сделано обслуживание"
            onChange={(e) => setServiceDone(e.target.value)}
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
            value={serviceBook}
            label="Сервисная книжка"
            onChange={(e) => setServiceBook(e.target.value)}
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
