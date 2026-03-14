"use client";

import { useState, useEffect } from "react";
import { TextField } from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";

type Props = {
  onNext?: () => void;
  onValidChange?: (valid: boolean) => void;
};

export function CarDescriptionSection({ onNext, onValidChange }: Props) {
  const [description, setDescription] = useState("");

  useEffect(() => {
    const valid = description.length >= 20;

    onValidChange?.(valid);
  }, [description, onValidChange]);

  return (
    <SectionContainer
      id="description"
      title="Описание автомобиля"
      description="Расскажите подробнее о состоянии автомобиля и обслуживании"
      required
      isValid={description.length >= 20}
      onNext={onNext}
    >
      <div className="grid gap-4">

        <TextField
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={5}
          fullWidth
          placeholder="Например: автомобиль в хорошем состоянии, обслуживался вовремя, недавно заменены тормоза и масло..."
        />

      </div>
    </SectionContainer>
  );
}