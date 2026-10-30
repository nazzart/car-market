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
// Значение = ключ, как в объявлении (Listing.mileageLatvia)
const mileageLvOptions = ["none", "upTo10k", "from10to50k", "from50to100k", "over100k", "unknown"].map((key) => [key, key]);

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
  const tCommon = useTranslations("common");

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
          <InputLabel id="sell-owners-label">{t("owners")}</InputLabel>

          <Select
            labelId="sell-owners-label"
            value={data.owners ?? ""}
            label={t("owners")}
            onChange={(e) => updateField("owners", e.target.value)}
          >
            {/* необязательное поле: выбор можно снять */}
            <MenuItem value="">
              <span className="text-gray-500">{tCommon("notSpecified")}</span>
            </MenuItem>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="4+">4+</MenuItem>
          </Select>
        </FormControl>

        {/* Mileage Latvia */}

        <FormControl fullWidth>
          <InputLabel id="sell-mileageLv-label">{t("mileageLv")}</InputLabel>

          <Select
            labelId="sell-mileageLv-label"
            value={data.mileageLatvia ?? ""}
            label={t("mileageLv")}
            onChange={(e) => updateField("mileageLatvia", e.target.value)}
          >
            {/* необязательное поле: выбор можно снять */}
            <MenuItem value="">
              <span className="text-gray-500">{tCommon("notSpecified")}</span>
            </MenuItem>
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
          <InputLabel id="sell-inspection-label">{t("inspection")}</InputLabel>

          <Select
            labelId="sell-inspection-label"
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
