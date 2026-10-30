"use client";

import { useState } from "react";
import { Autocomplete, TextField, MenuItem, InputAdornment } from "@mui/material";
import { useTranslations } from "next-intl";

import SearchSelect, { popupSlotProps } from "@/components/ui/SearchSelect";
import { listingTitle, modelEntryMatches, normalizeVersion, versionGroup, versionGroupsOf } from "@/features/cars/lib/version";
import { useBrandModels, useBrands } from "@/features/catalog/hooks";
import type { Brand } from "@/features/catalog/types";
import { carColors } from "@/features/cars/config/colors";

import { SectionContainer } from "../components/SectionContainer";
import { ChipSelect } from "../../../components/ui/chip-select/ChipSelect";
import { useSectionNext } from "../hooks/useSectionNext";
import type { FormStepProps, ModelOption } from "../types";
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

  // каталог: марки — с сервера при загрузке страницы, модели с версиями — по выбранной марке
  const brands = useBrands();
  const catalog = useBrandModels(data.brand);
  const versionsOf = (model: string) => catalog?.find((m) => m.name === model)?.versions ?? [];
  const versions = versionsOf(data.model);
  const brandName = brands.find((b) => b.slug === data.brand)?.name ?? "";
  const carTitle = data.model ? listingTitle(brandName, data.model, data.version) : "";
  const brandOption = (b: Brand) => ({ value: b.slug, label: b.name });
  // что введено в поле модели (модель — только из списка; ввод — для поиска, в т. ч. «530d»)
  const [modelQuery, setModelQuery] = useState("");

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
          <SearchSelect
            label={t("brand")}
            required
            featured={brands.filter((b) => b.popular).map(brandOption)}
            featuredLabel={t("popularBrands")}
            options={brands.map(brandOption)}
            allLabel={t("allBrands")}
            value={data.brand ?? ""}
            onChange={(slug) => {
              updateField("brand", slug);
              updateField("model", "");
              updateField("version", "");
            }}
            error={attemptedNext && !validateField(data.brand, getRules("brand"))}
          />

          {/* модель — только из каталога; под каждой моделью — группы версий («5 Series» → 530):
              выбор версии сразу заполняет модель и версию, «530d» в поле → 5 Series + 530d */}
          <Autocomplete<ModelOption>
            options={(catalog ?? []).flatMap(({ name, versions }) => [
              { model: name },
              ...versionGroupsOf(versions).map((version) => ({ model: name, version })),
            ])}
            value={data.model ? { model: data.model } : null}
            inputValue={modelQuery}
            getOptionLabel={(o) => o.model}
            isOptionEqualToValue={(o, v) => o.model === v.model && o.version === v.version}
            filterOptions={(options, { inputValue }) =>
              // выбранная модель в поле — показываем весь список
              inputValue === data.model ? options : options.filter((o) => modelEntryMatches(o, inputValue, versionsOf(o.model)))
            }
            loading={Boolean(data.brand) && catalog === undefined}
            noOptionsText={t("modelNotFound")}
            renderOption={({ key, ...props }, o, { inputValue }) => (
              <li key={`${String(key)}|${o.version ?? ""}`} {...props}>
                {/* версия — с отступом под моделью; при поиске модели рядом может не быть — «5 Series · 530» */}
                {o.version ? (
                  inputValue && inputValue !== data.model ? (
                    <span>
                      {o.model} <span className="text-gray-500">· {o.version}</span>
                    </span>
                  ) : (
                    <span className="pl-4 text-gray-700">{o.version}</span>
                  )
                ) : (
                  o.model
                )}
              </li>
            )}
            onInputChange={(_, text) => setModelQuery(text)}
            onChange={(_, o) => {
              if (!o) {
                updateField("model", "");
                updateField("version", "");
                return;
              }
              if (o.version) {
                // вписали полную версию («530d») — она и остаётся; иначе группа («530»), уточнить можно в поле версии
                const typed = normalizeVersion(modelQuery, versionsOf(o.model));
                const known = versionsOf(o.model).includes(typed) && versionGroup(typed) === o.version;
                updateField("version", known ? typed : o.version);
              } else if (o.model !== data.model) updateField("version", "");
              updateField("model", o.model);
            }}
            disabled={!data.brand}
            slotProps={popupSlotProps}
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

          <Autocomplete
            freeSolo
            options={versions}
            value={data.version || null}
            inputValue={data.version ?? ""}
            onInputChange={(_, text, reason) => {
              if (reason !== "reset") updateField("version", text);
            }}
            onChange={(_, value) => updateField("version", value ?? "")}
            // своё написание — к единому виду: «530D XDRIVE» → «530e xDrive»
            onBlur={() => updateField("version", normalizeVersion(data.version ?? "", versions))}
            disabled={!data.model}
            slotProps={popupSlotProps}
            autoHighlight
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("version")}
                placeholder={t("versionPlaceholder")}
                helperText={t("versionHint")}
              />
            )}
          />

          {/* заголовок собирается сам — продавец видит его сразу */}
          <div className="flex flex-col justify-center min-h-14 px-4 py-2 rounded-control bg-gray-50 md:mb-6">
            <span className="text-xs text-gray-500">{t("titlePreview")}</span>
            <span className="font-medium text-gray-900 truncate">{carTitle || "—"}</span>
          </div>
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
