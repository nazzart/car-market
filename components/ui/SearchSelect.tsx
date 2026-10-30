"use client";

import { Autocomplete, TextField } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useTranslations } from "next-intl";

import { foldText } from "@/lib/places";
import { cn } from "@/lib/utils";

import type { GroupedOption, SelectOption } from "./types";

// Общий вид выпадающих списков с поиском (марка, модель, город): скруглённое окно, мягкая подсветка,
// заголовки групп и галочка у выбранного
export const popupSlotProps = {
  paper: {
    sx: {
      mt: 0.75,
      borderRadius: "16px",
      border: "1px solid #f3f4f6",
      boxShadow: "0 16px 40px rgba(17, 24, 39, 0.12)",
    },
  },
  listbox: {
    sx: {
      maxHeight: 340,
      p: 0.5,
      "& .MuiAutocomplete-option": {
        minHeight: 40,
        px: 1.5,
        borderRadius: "10px",
        fontSize: 14,
        color: "#111827",
      },
      "& .MuiAutocomplete-option.Mui-focused": { backgroundColor: "#f3f4f6" },
      "& .MuiAutocomplete-option[aria-selected='true']": { backgroundColor: "transparent", fontWeight: 600 },
      "& .MuiAutocomplete-option[aria-selected='true'].Mui-focused": { backgroundColor: "#f3f4f6" },
    },
  },
} as const;

type GroupHeaderProps = { children: React.ReactNode };

export function GroupHeader({ children }: GroupHeaderProps) {
  return <div className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{children}</div>;
}

type SearchSelectProps = {
  options: SelectOption[];
  featured?: SelectOption[]; // показываются сверху отдельной группой, пока ничего не введено
  featuredLabel?: string;
  allLabel?: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  // "field" — поле формы MUI (форма продажи); "compact" — как остальные фильтры поиска
  variant?: "field" | "compact";
};

// Каждое введённое слово — начало слова в названии: «to» → Toyota (а не Aston Martin), «rover» → Land Rover
const words = (text: string) => foldText(text).split(/[\s\-./]+/).filter(Boolean);
export const matchesQuery = (option: SelectOption, query: string) => {
  const optionWords = words(`${option.label} ${option.keywords ?? ""}`);
  return words(query).every((q) => optionWords.some((w) => w.startsWith(q)));
};

export default function SearchSelect({
  options,
  featured,
  featuredLabel,
  allLabel,
  value,
  onChange,
  label,
  placeholder,
  disabled,
  required,
  error,
  helperText,
  variant = "field",
}: SearchSelectProps) {
  const t = useTranslations("common.select");
  const grouped = Boolean(featured?.length);
  const all: GroupedOption[] = [
    ...(featured ?? []).map((o) => ({ ...o, group: featuredLabel })),
    ...options.map((o) => ({ ...o, group: grouped ? allLabel : undefined })),
  ];
  const selected = options.find((o) => o.value === value) ?? null;
  const searching = (inputValue: string) => Boolean(inputValue) && !(selected && inputValue === (selected.fullLabel ?? selected.label));

  return (
    <Autocomplete<GroupedOption, false, false, false>
      options={all}
      value={selected}
      onChange={(_, option) => onChange(option?.value ?? "")}
      getOptionLabel={(o) => o.fullLabel ?? o.label}
      getOptionKey={(o) => `${o.group ?? ""}:${o.value}`}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      groupBy={grouped ? (o) => o.group ?? "" : undefined}
      // пока ищут — без «популярных», иначе одна марка показывается дважды
      filterOptions={(list, state) =>
        searching(state.inputValue)
          ? list.filter((o) => (!grouped || o.group === allLabel) && matchesQuery(o, state.inputValue))
          : list.filter((o) => !o.searchOnly || o.value === value)
      }
      renderGroup={(group) => (
        <li key={group.key}>
          <GroupHeader>{group.group}</GroupHeader>
          <ul>{group.children}</ul>
        </li>
      )}
      renderOption={({ key, ...props }, option, { selected: isSelected, inputValue }) => (
        <li key={key} {...props}>
          {/* вложенный вариант — с отступом; при поиске родителя рядом может не быть — полная подпись */}
          <span className={cn("flex-1 min-w-0 truncate", option.indent && !searching(inputValue) && "pl-4 text-gray-700")}>
            {option.indent && searching(inputValue) ? option.fullLabel ?? option.label : option.label}
          </span>
          {option.count ? <span className="ml-3 text-xs text-gray-400 tabular-nums">{option.count}</span> : null}
          <CheckIcon sx={{ fontSize: 16 }} className={`ml-2 text-primary ${isSelected ? "" : "invisible"}`} />
        </li>
      )}
      noOptionsText={t("noResults")}
      disabled={disabled}
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
              placeholder={placeholder}
              className={`w-full h-11 pl-3 pr-9 rounded-xl border bg-white text-sm text-gray-900 placeholder:text-gray-500 outline-none transition ${
                disabled
                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "border-gray-200 hover:border-gray-300 focus:border-gray-900"
              }`}
            />
            {value && !disabled ? (
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
            placeholder={placeholder}
            required={required}
            error={error}
            helperText={helperText}
          />
        )
      }
    />
  );
}
