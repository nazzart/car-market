"use client";

import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useTranslations } from "next-intl";

import { SectionContainer } from "../components/SectionContainer";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";
import { useSectionValidation } from "../hooks/useSectionValidation";
import { validateField } from "../utils/validationRules";

// значение в форме → ключ перевода
const mileageLvOptions = [
  ["0", "none"],
  ["10000", "upTo10k"],
  ["50000", "from10to50k"],
  ["100000", "from50to100k"],
  ["100000+", "over100k"],
  ["unknown", "unknown"],
];

export function CarHistorySection({
  id,
  title,
  data,
  required,
  fields,
  onNext,
  updateField,
}: FormStepProps) {
  const t = useTranslations("sell.history");

  const { isValid } = useSectionValidation(fields, data);

  const { attemptedNext, handleNext } = useSectionNext(
    isValid,
    required,
    onNext
  );

  const getRules = (name: string) => fields.find((f) => f.name === name)?.rules;

  // генерация техосмотра
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
      id={id}
      title={title}
      description={t("description")}
      required={required}
      isValid={isValid}
      onNext={handleNext}
    >
      <div className="grid md:grid-cols-2 gap-4">
        {/* VIN */}

        <TextField
          label={t("vin")}
          value={data.vin ?? ""}
          onChange={(e) => updateField("vin", e.target.value.toUpperCase())}
          fullWidth
        />

        {/* Owners */}

        <FormControl fullWidth>
          <InputLabel>{t("owners")}</InputLabel>

          <Select
            value={data.owners ?? ""}
            label={t("owners")}
            onChange={(e) => updateField("owners", e.target.value)}
          >
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="4+">4+</MenuItem>
          </Select>
        </FormControl>

        {/* Mileage Latvia */}

        <FormControl fullWidth>
          <InputLabel>{t("mileageLv")}</InputLabel>

          <Select
            value={data.mileageLatvia ?? ""}
            label={t("mileageLv")}
            onChange={(e) => updateField("mileageLatvia", e.target.value)}
          >
            {mileageLvOptions.map(([value, key]) => (
              <MenuItem key={value} value={value}>
                {t(`mileageLvOptions.${key}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Inspection */}

        <FormControl
          fullWidth
          error={
            attemptedNext &&
            !validateField(data.inspectionUntil, getRules("inspectionUntil"))
          }
        >
          <InputLabel>{t("inspection")}</InputLabel>

          <Select
            value={data.inspectionUntil ?? ""}
            label={t("inspection")}
            onChange={(e) => updateField("inspectionUntil", e.target.value)}
          >
            <MenuItem value="none">{t("none")}</MenuItem>

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
