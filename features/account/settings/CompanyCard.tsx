"use client";

import { Autocomplete, Chip, TextField } from "@mui/material";
import { useTranslations } from "next-intl";

import { ChipGroup } from "@/components/ui/form";
import { useBrandName, useBrands } from "@/features/catalog/hooks";
import type { Dealer } from "@/features/dealers/types";

import type { DealerSettingsForm } from "../types";
import SettingsCard from "./SettingsCard";


type CompanyCardProps = { settings: DealerSettingsForm };

// Компания: название, регистрационный номер, тип (официальный дилер — с марками), описание
export default function CompanyCard({ settings }: CompanyCardProps) {
  const brandOptions = useBrands().map((b) => b.slug);
  const brandName = useBrandName();
  const t = useTranslations("account.settings");
  const { form, set, show } = settings;

  return (
    <SettingsCard title={t("company.title")}>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField
          label={t("company.name")}
          autoComplete="organization"
          value={form.name}
          onChange={(e) => set("name")(e.target.value)}
          error={show("name")}
          helperText={show("name") && t("personal.required")}
          required
          fullWidth
        />
        <TextField
          label={t("company.regNumber")}
          inputMode="numeric"
          value={form.regNumber}
          onChange={(e) => set("regNumber")(e.target.value)}
          error={show("regNumber")}
          helperText={show("regNumber") ? t("company.regNumberError") : t("company.regNumberHint")}
          required
          fullWidth
        />

        <div className="sm:col-span-2">
          <div className="text-sm font-medium text-gray-900 mb-2">{t("company.type")}</div>
          <ChipGroup
            options={[
              { value: "official", label: t("company.official") },
              { value: "used", label: t("company.used") },
            ]}
            value={form.type}
            onChange={(value) => value && set("type")(value as Dealer["type"])}
          />
        </div>

        {form.type === "official" && (
          <Autocomplete
            multiple
            className="sm:col-span-2"
            options={brandOptions}
            getOptionLabel={brandName}
            value={form.brands}
            onChange={(_, value) => set("brands")(value)}
            renderValue={(value, getItemProps) =>
              value.map((slug, index) => {
                const { key, ...itemProps } = getItemProps({ index });
                return <Chip key={key} label={brandName(slug)} size="small" {...itemProps} />;
              })
            }
            renderInput={(params) => <TextField {...params} label={t("company.brands")} helperText={t("company.brandsHint")} />}
          />
        )}

        <TextField
          className="sm:col-span-2"
          label={t("company.description")}
          helperText={t("company.descriptionHint")}
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          multiline
          minRows={3}
          fullWidth
        />
      </div>
    </SettingsCard>
  );
}
