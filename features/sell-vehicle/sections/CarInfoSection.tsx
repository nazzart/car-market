"use client";

import { useState } from "react";
import { Autocomplete, TextField, MenuItem, InputAdornment } from "@mui/material";
import { useTranslations } from "next-intl";

import SearchSelect, { popupSlotProps } from "@/components/ui/SearchSelect";
import { fuelOfVersion, listingTitle, modelMatches, normalizeVersion, versionFromQuery } from "@/features/cars/lib/version";
import { useAuth } from "@/features/auth/store";
import { useBrandModels, useBrands } from "@/features/catalog/hooks";
import type { Brand } from "@/features/catalog/types";
import { carColors } from "@/features/cars/config/colors";

import { SectionContainer } from "../components/SectionContainer";
import { ChipSelect } from "../../../components/ui/chip-select/ChipSelect";
import { useSectionNext } from "../hooks/useSectionNext";
import type { FormStepProps } from "../types";
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
  const tForm = useTranslations("sell.form");
  const isDealer = useAuth().user?.type === "dealer";
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

  // версия; если по ней топливо однозначно (530d — дизель), а топливо ещё не выбрано — подставляем
  const setVersion = (version: string) => {
    updateField("version", version);
    const fuel = version && !data.fuel ? fuelOfVersion(version) : undefined;
    if (fuel) updateField("fuel", fuel);
  };

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

          {/* модель — только из каталога, без версий; ввод «530d» тоже находит 5 Series и сразу ставит версию */}
          <Autocomplete<string>
            options={(catalog ?? []).map((m) => m.name)}
            value={data.model || null}
            inputValue={modelQuery}
            filterOptions={(options, { inputValue }) =>
              // выбранная модель в поле — показываем весь список
              inputValue === data.model ? options : options.filter((m) => modelMatches(m, inputValue, versionsOf(m)))
            }
            renderOption={({ key, ...props }, model, { inputValue }) => {
              // нашлась по версии — подсказываем, по какой
              const byVersion = inputValue !== data.model ? versionFromQuery(inputValue, versionsOf(model)) : undefined;
              return (
                <li key={key} {...props}>
                  {model} {byVersion && <span className="text-gray-500">· {byVersion}</span>}
                </li>
              );
            }}
            loading={Boolean(data.brand) && catalog === undefined}
            noOptionsText={t("modelNotFound")}
            onInputChange={(_, text) => setModelQuery(text)}
            onChange={(_, model) => {
              // вписали версию («530d») — она тоже заполняется; другая модель — версия сбрасывается
              const version = model ? versionFromQuery(modelQuery, versionsOf(model)) : undefined;
              if (version) setVersion(version);
              else if (model !== data.model) updateField("version", "");
              updateField("model", model ?? "");
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

          {/* версия — одно поле: полные версии модели из каталога (530d, 530e xDrive…) или своя */}
          <Autocomplete
            freeSolo
            options={versions}
            value={data.version || null}
            inputValue={data.version ?? ""}
            onInputChange={(_, text, reason) => {
              if (reason !== "reset") updateField("version", text);
            }}
            onChange={(_, value) => setVersion(value ?? "")}
            // своё написание — к единому виду: «530D XDRIVE» → «530d xDrive»; лишние знаки убираются
            onBlur={() => setVersion(normalizeVersion(data.version ?? "", versions))}
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
            {/* необязательное поле: выбор можно снять */}
            <MenuItem value="">
              <span className="text-gray-500">{tCommon("notSpecified")}</span>
            </MenuItem>
            <MenuItem value="yes">{t("negotiableYes")}</MenuItem>
            <MenuItem value="no">{t("negotiableNo")}</MenuItem>
          </TextField>
        </div>

        {/* Лизинг — только дилеры. Пустой платёж — без лизинга; взнос и срок — по желанию */}
        {isDealer && (
          <div className="rounded-control border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-900">
              {t("leasing.title")} <span className="font-normal text-gray-500">· {tForm("optionalShort")}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 mb-4">{t("leasing.hint")}</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <TextField
                label={t("leasing.monthly")}
                type="number"
                fullWidth
                value={data.leasingMonthly ?? ""}
                onChange={(e) => {
                  updateField("leasingMonthly", e.target.value);
                  // без платежа нет и лизинга
                  if (!e.target.value) {
                    updateField("leasingDownPayment", "");
                    updateField("leasingMonths", "");
                  }
                }}
                error={!validateField(data.leasingMonthly, getRules("leasingMonthly"))}
                InputProps={{ endAdornment: <InputAdornment position="end">{t("leasing.unitMonthly")}</InputAdornment> }}
                inputProps={{ min: 1 }}
              />
              <TextField
                label={t("leasing.down")}
                type="number"
                fullWidth
                disabled={!data.leasingMonthly}
                value={data.leasingDownPayment ?? ""}
                onChange={(e) => updateField("leasingDownPayment", e.target.value)}
                error={!validateField(data.leasingDownPayment, getRules("leasingDownPayment"))}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                inputProps={{ min: 0, max: 90 }}
              />
              <TextField
                label={t("leasing.months")}
                type="number"
                fullWidth
                disabled={!data.leasingMonthly}
                value={data.leasingMonths ?? ""}
                onChange={(e) => updateField("leasingMonths", e.target.value)}
                error={!validateField(data.leasingMonths, getRules("leasingMonths"))}
                helperText={!validateField(data.leasingMonths, getRules("leasingMonths")) ? "6–120" : undefined}
                InputProps={{ endAdornment: <InputAdornment position="end">{t("leasing.unitMonths")}</InputAdornment> }}
                inputProps={{ min: 6, max: 120 }}
              />
            </div>
          </div>
        )}

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
