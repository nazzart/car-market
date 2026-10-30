"use client";

import { useState, useRef, useEffect } from "react";
import { Chip, IconButton } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslations } from "next-intl";
import { ChipSelectProps } from "./types";

export function ChipSelect({
  label,
  options = [],
  value,
  onChange,
  multiple = false,
  placeholder,
  variant = "chip",
  clearable = true,
  disableUnselect = false,
  error,
  required,
  inline = false,
}: ChipSelectProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // выбранные значения отдельно для мультивыбора и одиночного выбора — так типы точные
  const selectedList: string[] = multiple && Array.isArray(value) ? value : [];
  const selectedOne: string | null = !multiple && typeof value === "string" && value ? value : null;
  const isSelected = (optionValue: string) =>
    multiple ? selectedList.includes(optionValue) : selectedOne === optionValue;

  const hasValue = multiple ? selectedList.length > 0 : selectedOne !== null;

  const isError = error || (touched && required && !hasValue);
  const handleSelect = (optionValue: string) => {
    setTouched(true);
    if (multiple) {
      const selected = selectedList.includes(optionValue);

      if (selected) {
        if (disableUnselect) return;
        onChange(selectedList.filter((v) => v !== optionValue));
      } else {
        onChange([...selectedList, optionValue]);
      }
    } else {
      if (selectedOne === optionValue) {
        if (disableUnselect) return;
        onChange(null);
      } else {
        onChange(optionValue);
      }
      setOpen(false);
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disableUnselect) return;
    onChange(multiple ? [] : null);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (inline) {
    const selectedLabel =
      !multiple && hasValue
        ? options.find((o) => o.value === selectedOne)?.label
        : null;

    return (
      <div>
        <div className={`text-sm font-medium mb-2.5 ${isError ? "text-error" : "text-gray-900"}`}>
          {label}
          {required && <span className="ml-0.5">*</span>}
          {variant === "color" && selectedLabel && (
            <span className="font-normal text-gray-500"> · {selectedLabel}</span>
          )}
        </div>

        {variant === "color" ? (
          <div className="flex flex-wrap gap-2.5">
            {options.map((option) => {
              const selected = selectedOne === option.value;
              const light = ["white", "beige", "silver", "yellow"].includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  title={option.label}
                  aria-label={option.label}
                  aria-pressed={selected}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-9 h-9
                    flex items-center justify-center
                    rounded-full
                    border border-black/10
                    transition
                    cursor-pointer
                    ${selected ? "ring-2 ring-gray-900 ring-offset-2" : "hover:scale-110"}
                  `}
                  style={{ background: option.color }}
                >
                  {selected && (
                    <CheckIcon
                      sx={{ fontSize: 18 }}
                      className={light ? "text-gray-900" : "text-white"}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const selected = isSelected(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    px-4 py-2
                    rounded-full
                    border
                    text-sm
                    transition
                    cursor-pointer
                    ${
                      selected
                        ? "bg-gray-900 border-gray-900 text-white"
                        : isError
                        ? "border-error/50 text-gray-700 hover:border-gray-900"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-900"
                    }
                  `}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        {isError && <p className="text-xs text-error mt-2">{t("chooseOption")}</p>}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative space-y-2">
      {/* Floating label */}
      <label
        className={`
          absolute left-3 px-1 pointer-events-none transition-all duration-200
          bg-white font-normal leading-none
          ${
            open || hasValue
              ? "top-[-8px] text-[12px]"
              : "top-[20px] text-[16px]"
          }
          ${isError ? "text-error" : open ? "text-gray-900" : "text-gray-600"}
        `}
      >
        {label}
        {required && <span className="ml-0.5">*</span>}
      </label>

      {/* Select field */}
      <div
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center justify-between
          rounded-xl border
          pl-3 pr-2 h-[56px]
          cursor-pointer
         
          ${
            isError
              ? open
                ? "border border-error ring-1 ring-error shadow-[0_0_0_2px_rgba(211,47,47,0.12)]"
                : "border border-error"
              : open
              ? "border-gray-900 ring-1 ring-gray-900"
              : "border border-gray-300 hover:border-gray-700"
          }
        `}
      >
        {/* Left side */}
        <div className="flex items-center gap-2 overflow-hidden">
          {!hasValue ? (
            <span
              className={`text-sm ${isError ? "text-error" : "text-gray-400"}`}
            >
              {placeholder}
            </span>
          ) : multiple ? (
            (() => {
              const visible = selectedList.slice(0, 3);
              const hidden = selectedList.length - visible.length;

              return (
                <>
                  {visible.map((v: string) => {
                    const option = options.find((o) => o.value === v);

                    return (
                      <Chip
                        key={v}
                        label={option?.label}
                        size="small"
                        sx={{ height: 24 }}
                        icon={
                          option?.color ? (
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: option.color,
                                border: "1px solid rgba(0,0,0,0.2)",
                              }}
                            />
                          ) : undefined
                        }
                      />
                    );
                  })}

                  {hidden > 0 && (
                    <Chip
                      label={`+${hidden}`}
                      size="small"
                      sx={{ height: 24 }}
                    />
                  )}
                </>
              );
            })()
          ) : (
            (() => {
              const option = options.find((o) => o.value === selectedOne);

              return (
                <Chip
                  label={option?.label}
                  size="small"
                  sx={{ height: 24 }}
                  icon={
                    option?.color ? (
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: option.color,
                          border: "1px solid rgba(0,0,0,0.2)",
                        }}
                      />
                    ) : undefined
                  }
                />
              );
            })()
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center">
          {clearable && hasValue && !disableUnselect && (
            <IconButton size="small" onClick={clearSelection}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}

          <ArrowDropDownIcon
            sx={{
              fontSize: 24,
              color: "rgba(0, 0, 0, 0.54)",
              transform: open ? "rotate(180deg)" : "none",
            }}
          />
        </div>
      </div>

      {/* Dropdown */}
      <div
        className={`
          overflow-hidden transition-all duration-200
          ${
            open
              ? "max-h-[300px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-1"
          }
        `}
      >
        {variant === "color" ? (
          <div className="flex flex-wrap gap-3 pt-3">
            {options.map((option) => {
              const selected = isSelected(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  title={option.label}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-9 h-9 rounded-full border-2 transition-all
                    ${
                      selected
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:scale-105 hover:border-gray-400"
                    }
                  `}
                  style={{ background: option.color }}
                />
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
            {options.map((option) => {
              const selected = isSelected(option.value);

              return (
                <Chip
                  key={option.value}
                  label={option.label}
                  clickable
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => handleSelect(option.value)}
                  sx={{
                    height: 36,
                    width: "100%",
                    ...(selected && {
                      bgcolor: "#111827",
                      color: "#fff",
                      "&:hover": { bgcolor: "#000" },
                    }),
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
