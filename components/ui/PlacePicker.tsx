"use client";

import { Autocomplete, TextField, createFilterOptions } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useLocale, useTranslations } from "next-intl";

import { PLACES, Place, findPlace, foldText } from "@/lib/places";

type Props = {
  value: string; // ключ места или ""
  onChange: (key: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  // "field" — поле формы MUI (настройки, форма продажи); "compact" — как остальные фильтры поиска
  variant?: "field" | "compact";
};

// Выбор города или края с поиском: «sig» → Sigulda, «кекав» → Ķekava; без диакритики тоже находит
export default function PlacePicker({ value, onChange, label, placeholder, required, error, helperText, variant = "field" }: Props) {
  const t = useTranslations("common.places");
  const locale = useLocale();
  const name = (p: Place) => (locale === "ru" ? p.ru : p.lv);

  const filter = createFilterOptions<Place>({
    // ищем и по-латышски, и по-русски — продавец может набрать как привык
    stringify: (p) => foldText(`${p.lv} ${p.ru}`),
    matchFrom: "any",
  });

  return (
    <Autocomplete<Place, false, false, false>
      options={PLACES}
      value={findPlace(value) ?? null}
      onChange={(_, place) => onChange(place?.key ?? "")}
      getOptionLabel={name}
      isOptionEqualToValue={(a, b) => a.key === b.key}
      groupBy={(p) => (p.kind === "city" ? t("cities") : t("municipalities"))}
      filterOptions={(options, state) => filter(options, { ...state, inputValue: foldText(state.inputValue) })}
      renderGroup={(group) => (
        <li key={group.key}>
          <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{group.group}</div>
          <ul>{group.children}</ul>
        </li>
      )}
      noOptionsText={t("noResults")}
      autoHighlight
      fullWidth
      popupIcon={<KeyboardArrowDownIcon fontSize="small" />}
      slotProps={{ paper: { sx: { borderRadius: 3, mt: 0.5 } }, listbox: { sx: { maxHeight: 320 } } }}
      renderInput={(params) =>
        variant === "compact" ? (
          <div ref={params.InputProps.ref} className="relative">
            <input
              {...params.inputProps}
              aria-label={label}
              placeholder={placeholder ?? t("search")}
              className="w-full h-11 pl-3 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-500 outline-none hover:border-gray-300 focus:border-gray-900 transition"
            />
            <KeyboardArrowDownIcon
              fontSize="small"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        ) : (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder ?? t("search")}
            required={required}
            error={error}
            helperText={helperText ?? t("hint")}
          />
        )
      }
    />
  );
}
