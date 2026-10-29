"use client";

import { Autocomplete, TextField, MenuItem, InputAdornment } from "@mui/material";
import { useTranslations } from "next-intl";

import { brands } from "@/features/brands/data/brands";
import { modelsByBrand } from "@/features/brands/data/models";
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

  const models = modelsByBrand[data.brand] ?? [];

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
          {/* марка — из списка (по ней работает поиск); модель — из списка или своя, если её там нет */}
          <Autocomplete
            options={brands}
            value={brands.find((b) => b.slug === data.brand) ?? null}
            onChange={(_, brand) => {
              updateField("brand", brand?.slug ?? "");
              updateField("model", "");
            }}
            getOptionLabel={(b) => b.name}
            isOptionEqualToValue={(a, b) => a.slug === b.slug}
            autoHighlight
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("brand")}
                required
                error={attemptedNext && !validateField(data.brand, getRules("brand"))}
              />
            )}
          />

          <Autocomplete
            freeSolo
            options={models}
            value={data.model || null}
            inputValue={data.model ?? ""}
            onInputChange={(_, text) => updateField("model", text)}
            disabled={!data.brand}
            autoHighlight
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("model")}
                required
                placeholder={data.brand ? t("modelPlaceholder") : t("brandFirst")}
                helperText={data.brand ? t("modelHint") : undefined}
                error={attemptedNext && !validateField(data.model, getRules("model"))}
              />
            )}
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
