"use client";

import { TextField } from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";
import { useSectionValidation } from "../hooks/useSectionValidation";
import { validateField } from "../utils/validationRules";

export function ContactInfoSection({
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
      <div className="grid md:grid-cols-2 gap-4">
        {/* Name */}

        <TextField
          label="Имя"
          required
          value={data.sellerName ?? ""}
          onChange={(e) => updateField("sellerName", e.target.value)}
          error={
            attemptedNext &&
            !validateField(data.sellerName, getRules("sellerName"))
          }
          fullWidth
        />

        {/* Phone */}

        <TextField
          label="Телефон"
          value={data.sellerPhone ?? ""}
          onChange={(e) => updateField("sellerPhone", e.target.value)}
          error={
            attemptedNext &&
            !validateField(data.sellerPhone, getRules("sellerPhone"))
          }
          fullWidth
          required
          placeholder="+371..."
        />

        {/* Email */}

        <TextField
          label="Email"
          required
          value={data.sellerEmail ?? ""}
          onChange={(e) => updateField("sellerEmail", e.target.value)}
          error={
            attemptedNext &&
            !validateField(data.sellerEmail, getRules("sellerEmail"))
          }
          type="email"
          fullWidth
        />

        {/* City */}

        <TextField
          label="Город"
          required
          value={data.sellerCity ?? ""}
          onChange={(e) => updateField("sellerCity", e.target.value)}
          error={
            attemptedNext &&
            !validateField(data.sellerCity, getRules("sellerCity"))
          }
          fullWidth
        />
      </div>
    </SectionContainer>
  );
}
