"use client";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useTranslations } from "next-intl";

import { SectionContainer } from "../components/SectionContainer";
import { CarDamageSelector } from "./CarDamageSelector";
import { useSectionNext } from "../hooks/useSectionNext";
import { FormStepProps } from "../types";
import { useSectionValidation } from "../hooks/useSectionValidation";

export function CarConditionSection({
  id,
  title,
  data,
  required,
  fields,
  onNext,
  updateField,
}: FormStepProps) {
  const t = useTranslations("sell.condition");
  const tCommon = useTranslations("common");
  const { isValid } = useSectionValidation(fields, data);

  const { handleNext } = useSectionNext(isValid, required, onNext);

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
        {/* General condition */}

        <FormControl fullWidth>
          <InputLabel>{t("overall")}</InputLabel>

          <Select
            value={data.condition ?? ""}
            label={t("overall")}
            onChange={(e) => updateField("condition", e.target.value)}
          >
            {/* необязательное поле: выбор можно снять */}
            <MenuItem value="">
              <span className="text-gray-500">{tCommon("notSpecified")}</span>
            </MenuItem>
            {["excellent", "good", "average", "repair"].map((value) => (
              <MenuItem key={value} value={value}>
                {t(`overallOptions.${value}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Accident */}

        <FormControl fullWidth>
          <InputLabel>{t("accident")}</InputLabel>

          <Select
            value={data.hadAccident ?? ""}
            label={t("accident")}
            onChange={(e) => updateField("hadAccident", e.target.value)}
          >
            {/* необязательное поле: выбор можно снять */}
            <MenuItem value="">
              <span className="text-gray-500">{tCommon("notSpecified")}</span>
            </MenuItem>
            <MenuItem value="no">{t("no")}</MenuItem>
            <MenuItem value="yes">{t("yes")}</MenuItem>
            <MenuItem value="unknown">{t("unknown")}</MenuItem>
          </Select>
        </FormControl>

        {/* Service done */}

        <FormControl fullWidth>
          <InputLabel>{t("service")}</InputLabel>

          <Select
            value={data.hasServiceDone ?? ""}
            label={t("service")}
            onChange={(e) => updateField("hasServiceDone", e.target.value)}
          >
            {/* необязательное поле: выбор можно снять */}
            <MenuItem value="">
              <span className="text-gray-500">{tCommon("notSpecified")}</span>
            </MenuItem>
            {["recent", "partial", "required"].map((value) => (
              <MenuItem key={value} value={value}>
                {t(`serviceOptions.${value}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Service book */}

        <FormControl fullWidth>
          <InputLabel>{t("serviceBook")}</InputLabel>

          <Select
            value={data.hasServiceBook ?? ""}
            label={t("serviceBook")}
            onChange={(e) => updateField("hasServiceBook", e.target.value)}
          >
            {/* необязательное поле: выбор можно снять */}
            <MenuItem value="">
              <span className="text-gray-500">{tCommon("notSpecified")}</span>
            </MenuItem>
            <MenuItem value="yes">{t("has")}</MenuItem>
            <MenuItem value="no">{t("no")}</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="space-y-6">
        <CarDamageSelector
          value={data.damages}
          onChange={(value) => updateField("damages", value)}
        />
      </div>
    </SectionContainer>
  );
}
