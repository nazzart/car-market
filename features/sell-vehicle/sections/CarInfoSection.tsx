"use client";

import { TextField, MenuItem, InputAdornment } from "@mui/material";
import { useTranslations } from "next-intl";

import { carColors } from "@/features/cars/config/colors";

import { SectionContainer } from "../components/SectionContainer";
import { ChipSelect } from "../../../components/ui/chip-select/ChipSelect";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";
import { useSectionValidation } from "../hooks/useSectionValidation";
import { validateField } from "../utils/validationRules";
import { bodyTypes } from "@/features/cars/config/filterOptions";

export function CarInfoSection({
  id,
  title,
  data,
  required,
  fields,
  onNext,
  updateField,
}: FormStepProps) {
  const t = useTranslations("sell.info");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");

  const brands = ["Audi", "BMW", "Mercedes"];

  const colorOptions = carColors.map((c) => ({ ...c, label: tOptions(`colors.${c.value}`) }));
  const bodyTypeOptions = bodyTypes.map((value) => ({ value, label: tOptions(`bodyType.${value}`) }));

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
      <div className="space-y-7">
        {/* Brand / Model */}

        <div className="grid md:grid-cols-2 gap-4">
          <TextField
            select
            label={t("brand")}
            required
            fullWidth
            value={data.brand ?? ""}
            onChange={(e) => updateField("brand", e.target.value)}
            error={
              attemptedNext && !validateField(data.brand, getRules("brand"))
            }
          >
            {brands.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t("model")}
            required
            placeholder={t("modelPlaceholder")}
            fullWidth
            value={data.model ?? ""}
            onChange={(e) => updateField("model", e.target.value)}
            error={
              attemptedNext && !validateField(data.model, getRules("model"))
            }
          />
        </div>

        {/* Year / Mileage */}

        <div className="grid md:grid-cols-2 gap-4">
          <TextField
            label={t("year")}
            type="number"
            required
            fullWidth
            value={data.year ?? ""}
            onChange={(e) => updateField("year", e.target.value)}
            error={attemptedNext && !validateField(data.year, getRules("year"))}
            inputProps={{ min: 0 }}
          />

          <TextField
            label={t("mileage")}
            type="number"
            required
            fullWidth
            value={data.mileage ?? ""}
            onChange={(e) => updateField("mileage", e.target.value)}
            error={
              attemptedNext && !validateField(data.mileage, getRules("mileage"))
            }
            InputProps={{
              endAdornment: <InputAdornment position="end">{tCommon("units.km")}</InputAdornment>,
            }}
            inputProps={{ min: 0 }}
          />
        </div>

        {/* Price / Negotiable */}

        <div className="grid md:grid-cols-2 gap-4">
          <TextField
            label={t("price")}
            type="number"
            required
            fullWidth
            value={data.price ?? ""}
            onChange={(e) => updateField("price", e.target.value)}
            error={
              attemptedNext && !validateField(data.price, getRules("price"))
            }
            InputProps={{
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            }}
            inputProps={{ min: 0 }}
          />

          <TextField
            select
            label={t("negotiable")}
            fullWidth
            value={data.negotiable ?? ""}
            onChange={(e) => updateField("negotiable", e.target.value)}
          >
            <MenuItem value="yes">{t("negotiableYes")}</MenuItem>
            <MenuItem value="no">{t("negotiableNo")}</MenuItem>
          </TextField>
        </div>

        {/* Body type */}

        <ChipSelect
          inline
          label={t("body")}
          options={bodyTypeOptions}
          value={data.bodyType}
          onChange={(value) => updateField("bodyType", value)}
          clearable
          disableUnselect
          required
          error={
            attemptedNext && !validateField(data.bodyType, getRules("bodyType"))
          }
        />

        {/* Color */}

        <ChipSelect
          inline
          label={t("color")}
          options={colorOptions}
          value={data.color}
          onChange={(value) => updateField("color", value)}
          variant="color"
          disableUnselect
          required
          error={attemptedNext && !validateField(data.color, getRules("color"))}
        />
      </div>
    </SectionContainer>
  );
}
