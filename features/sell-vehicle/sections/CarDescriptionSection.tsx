"use client";

import { TextField } from "@mui/material";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("sell.description");

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
          label={t("label")}
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
          placeholder={t("placeholder")}
        />

        <TextField
          label={t("video")}
          value={data.videoUrl ?? ""}
          onChange={(e) => updateField("videoUrl", e.target.value)}
          error={Boolean(data.videoUrl) && !validateField(data.videoUrl, getRules("videoUrl"))}
          helperText={
            data.videoUrl && !validateField(data.videoUrl, getRules("videoUrl")) ? t("videoError") : t("videoHint")
          }
          placeholder="https://www.youtube.com/watch?v=…"
          inputMode="url"
          fullWidth
          slotProps={{ input: { startAdornment: <YouTubeIcon className="text-red-600 mr-2" /> } }}
        />
      </div>
    </SectionContainer>
  );
}
