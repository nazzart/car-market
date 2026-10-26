"use client";

import { useState, useEffect } from "react";
import { TextField } from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";
import { useSectionValidation } from "../hooks/useSectionValidation";
import { validateField } from "../utils/validationRules";

export function CarDescriptionSection({
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
      <div className="grid gap-4">
        <TextField
          label="Описание"
          value={data.description ?? ""}
          onChange={(e) => updateField("description", e.target.value)}
          error={
            attemptedNext &&
            !validateField(data.description, getRules("description"))
          }
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
