"use client";

import { TextField, InputAdornment } from "@mui/material";
import { useTranslations } from "next-intl";
import { SectionContainer } from "../components/SectionContainer";
import { ChipSelect } from "../../../components/ui/chip-select/ChipSelect";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";
import { useSectionValidation } from "../hooks/useSectionValidation";
import { validateField } from "../utils/validationRules";

// Названия — messages/{locale}/options.json
const FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric", "gas"];
const TRANSMISSIONS = ["manual", "automatic"]; // DSG и вариатор — тоже автомат (как в фильтре /cars и в базе)
const DRIVES = ["fwd", "rwd", "awd"];

export function TechnicalSection({
  id,
  title,
  data,
  required,
  fields,
  onNext,
  updateField,
}: FormStepProps) {
  const t = useTranslations("sell.technical");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");

  const opts = (group: string, values: string[]) =>
    values.map((value) => ({ value, label: tOptions(`${group}.${value}`) }));

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
        {/* ENGINE */}

        <div className="space-y-4">
          <ChipSelect
            inline
            label={t("fuel")}
            options={opts("fuel", FUEL_TYPES)}
            value={data.fuel}
            onChange={(value) => updateField("fuel", value)}
            error={attemptedNext && !validateField(data.fuel, getRules("fuel"))}
            disableUnselect
            required
          />

          <div className="grid md:grid-cols-2 gap-4">
            <TextField
              label={t("engine")}
              value={data.engineCapacity ?? ""}
              onChange={(e) => {
                const value = e.target.value.replace(",", ".");
                updateField("engineCapacity", value);
              }}
              onBlur={() => {
                if (!data.engineCapacity) return;

                let value = data.engineCapacity.replace(",", ".");

                // если ввели "2" → "2.0"
                if (/^\d+$/.test(value)) {
                  value = value + ".0";
                }

                updateField("engineCapacity", value);
              }}
              error={
                attemptedNext &&
                !validateField(data.engineCapacity, getRules("engineCapacity"))
              }
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">{tCommon("units.liters")}</InputAdornment>,
              }}
            />

            <TextField
              label={t("power")}
              type="number"
              value={data.power ?? ""}
              onChange={(e) => updateField("power", e.target.value)}
              error={
                attemptedNext && !validateField(data.power, getRules("power"))
              }
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">{tCommon("units.hp")}</InputAdornment>
                ),
              }}
              inputProps={{ min: 0 }}
            />
          </div>
        </div>

        {/* TRANSMISSION */}

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <ChipSelect
              inline
              label={t("gearbox")}
              options={opts("transmission", TRANSMISSIONS)}
              value={data.transmission}
              onChange={(value) => updateField("transmission", value)}
              required
              error={
                attemptedNext &&
                !validateField(data.transmission, getRules("transmission"))
              }
              disableUnselect
            />

            <ChipSelect
              inline
              label={t("drive")}
              options={opts("drive", DRIVES)}
              value={data.drive}
              required
              onChange={(value) => updateField("drive", value)}
              error={
                attemptedNext && !validateField(data.drive, getRules("drive"))
              }
              disableUnselect
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
