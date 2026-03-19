"use client";

import { TextField } from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";

export function ContactInfoSection({
  id,
  title,
  data,
  required,
  fields,
  onNext,
  updateField,
}: FormStepProps) {
  const validFields = fields.every((f) => {
    const v = data[f];
    return typeof v === "string" ? v.trim() !== "" : Boolean(v);
  });

  const isValidEmail = (email?: string) => {
    if (!email) return false;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.sellerEmail);
  };

  const isValidPhone = (phone?: string) => {
    if (!phone) return false;

    return /^\+?[0-9]+$/.test(data.sellerPhone);
  };

  const isValid =
    validFields &&
    isValidEmail(data.sellerEmail) &&
    isValidPhone(data.sellerPhone);

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
      <div className="grid md:grid-cols-2 gap-4">
        {/* Name */}

        <TextField
          label="Имя"
          required
          value={data.sellerName ?? ""}
          onChange={(e) => updateField("sellerName", e.target.value)}
          error={attemptedNext && !data.sellerName}
          fullWidth
        />

        {/* Phone */}

        <TextField
          label="Телефон"
          value={data.sellerPhone ?? ""}
          onChange={(e) => updateField("sellerPhone", e.target.value)}
          error={
            attemptedNext &&
            (!data.sellerPhone || !isValidPhone(data.sellerPhone))
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
            (!data.sellerEmail || !isValidEmail(data.sellerEmail))
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
          error={attemptedNext && !data.sellerCity}
          fullWidth
        />
      </div>
    </SectionContainer>
  );
}
