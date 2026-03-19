"use client";

import { useState, useEffect } from "react";
import { TextField } from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";

export function CarDescriptionSection({
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

  return (
    <SectionContainer
      id={id}
      title={title}
      required={required}
      isValid={isValid}
      onNext={handleNext}
    >
      <div className="grid gap-4">
        <TextField
          label="Описание"
          value={data.description ?? ""}
          onChange={(e) => updateField("description", e.target.value)}
          error={attemptedNext && !data.description}
          multiline
          required
          rows={5}
          fullWidth
          placeholder="Например: автомобиль в хорошем состоянии, обслуживался вовремя, недавно заменены тормоза и масло..."
        />
      </div>
    </SectionContainer>
  );
}
