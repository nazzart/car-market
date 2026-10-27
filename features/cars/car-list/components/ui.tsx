"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Небольшие элементы фильтров в стиле главной страницы

type Option = { label: string; value: string };

export function FilterSection({
  title,
  active,
  children,
}: {
  title: string;
  active?: boolean; // в секции выбран фильтр — точка у заголовка
  children: React.ReactNode;
}) {
  return (
    <div className="py-5 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
        {title}
        {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      </div>
      {children}
    </div>
  );
}

export const inputClass = `
  w-full
  h-11
  px-3
  rounded-xl
  border border-gray-200
  bg-white
  text-sm text-gray-900
  placeholder:text-gray-500
  outline-none
  hover:border-gray-300
  focus:border-gray-900
  disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
  transition
`;

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  label: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <select
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-9 cursor-pointer ${
          value ? "" : "text-gray-500"
        }`}
      >
        <option value="">{placeholder}</option>

        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <KeyboardArrowDownIcon
        fontSize="small"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
    </div>
  );
}

// Одиночный выбор чипами; повторный клик снимает выбор
export function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = value === o.value;

        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : o.value)}
            className={`
              px-3 py-1.5
              rounded-full
              border
              text-sm
              transition
              cursor-pointer
              ${
                active
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "border-gray-200 text-gray-700 hover:border-gray-900"
              }
            `}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// Сегментированный переключатель с вариантом «любой»
export function Segmented({
  options,
  value,
  onChange,
  anyLabel,
}: {
  options: Option[];
  value: string;
  onChange: (value: string | null) => void;
  anyLabel: string;
}) {
  const all = [{ label: anyLabel, value: "" }, ...options];

  return (
    <div className="flex p-1 rounded-xl bg-gray-100">
      {all.map((o) => {
        const active = value === o.value;

        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value || null)}
            className={`
              flex-1
              px-1 py-1.5
              rounded-lg
              text-sm whitespace-nowrap
              transition
              cursor-pointer
              ${
                active
                  ? "bg-white text-gray-900 font-medium shadow-sm"
                  : "text-gray-600 hover:text-black"
              }
            `}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
