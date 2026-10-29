"use client";

import { useMemo } from "react";
import { Autocomplete, TextField, createFilterOptions } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useLocale, useTranslations } from "next-intl";

import { PLACES, Place, findPlace, foldText } from "@/lib/places";

import { GroupHeader, popupSlotProps } from "./SearchSelect";

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

  // группы по порядку; крупные города — по величине (Rīga первой), остальное — по алфавиту языка сайта
  const options = useMemo(() => {
    const collator = new Intl.Collator(locale);
    const group = (p: Place) => (p.major ? 0 : p.kind === "city" ? 1 : 2);
    const label = (p: Place) => (locale === "ru" ? p.ru : p.lv);
    return [...PLACES].sort((a, b) => group(a) - group(b) || (a.major ? 0 : collator.compare(label(a), label(b))));
  }, [locale]);

  const filter = createFilterOptions<Place>({
    // ищем и по-латышски, и по-русски — продавец может набрать как привык
    stringify: (p) => foldText([p.lv, p.ru, ...(p.aliases ?? []), p.hint?.lv, p.hint?.ru].join(" ")),
    matchFrom: "any",
  });

  return (
    <Autocomplete<Place, false, false, false>
      options={options}
      value={findPlace(value) ?? null}
      onChange={(_, place) => onChange(place?.key ?? "")}
      getOptionLabel={name}
      isOptionEqualToValue={(a, b) => a.key === b.key}
      // крупные города первыми — так их и ищут чаще всего
      groupBy={(p) => (p.major ? t("majorCities") : p.kind === "city" ? t("cities") : t("municipalities"))}
      // нашли по прежнему названию — показываем его рядом, иначе «Dienvidkurzemes novads» на «liepājas» непонятен
      renderOption={({ key, ...props }, p, { inputValue }) => {
        const query = foldText(inputValue);
        const alias = query && !foldText(`${p.lv} ${p.ru}`).includes(query) ? p.aliases?.find((a) => foldText(a).includes(query)) : undefined;
        return (
          <li key={key} {...props}>
            {name(p)}
            {alias ? (
              <span className="ml-1.5 text-sm text-gray-500">({alias})</span>
            ) : (
              p.hint && <span className="ml-1.5 text-sm text-gray-500">· {locale === "ru" ? p.hint.ru : p.hint.lv}</span>
            )}
          </li>
        );
      }}
      filterOptions={(options, state) => filter(options, { ...state, inputValue: foldText(state.inputValue) })}
      renderGroup={(group) => (
        <li key={group.key}>
          <GroupHeader>{group.group}</GroupHeader>
          <ul>{group.children}</ul>
        </li>
      )}
      noOptionsText={t("noResults")}
      autoHighlight
      fullWidth
      popupIcon={<KeyboardArrowDownIcon fontSize="small" />}
      slotProps={popupSlotProps}
      renderInput={(params) =>
        variant === "compact" ? (
          <div ref={params.InputProps.ref} className="relative">
            <input
              {...params.inputProps}
              aria-label={label}
              placeholder={placeholder ?? t("search")}
              className="w-full h-11 pl-3 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-500 outline-none hover:border-gray-300 focus:border-gray-900 transition"
            />
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label={t("clear")}
                title={t("clear")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            ) : (
              <KeyboardArrowDownIcon
                fontSize="small"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            )}
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
