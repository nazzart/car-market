"use client";

import { useState, useRef, useEffect } from "react";
import { Chip, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import { ChipSelectProps } from "./types";

export function ChipSelect({
  label,
  options = [],
  value,
  onChange,
  multiple = false,
  placeholder = "Выберите",
  variant = "chip",
  clearable = true,
  disableUnselect = false,
}: ChipSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentValue = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value ?? null;

  const hasValue = multiple ? currentValue.length > 0 : currentValue !== null;

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const selected = currentValue.includes(optionValue);

      if (selected) {
        if (disableUnselect) return;

        onChange(currentValue.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValue, optionValue]);
      }
    } else {
      if (currentValue === optionValue) {
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

  return (
    <div ref={ref} className="space-y-2">
      {/* label */}

      <label className="text-sm text-gray-600">{label}</label>

      {/* select field */}

      <div
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center justify-between
          rounded-md border
          px-3 h-[56px]
          cursor-pointer
          transition-all
          ${
            open
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-gray-300 hover:border-gray-700"
          }
        `}
      >
        <div className="flex flex-nowrap items-center gap-2 overflow-hidden">
          {!hasValue ? (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          ) : multiple ? (
            (() => {
              const visible = currentValue.slice(0, 3);
              const hidden = currentValue.length - visible.length;

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
              const option = options.find((o) => o.value === currentValue);

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

        <div className="flex items-center">
          {clearable && hasValue && !disableUnselect && (
            <IconButton size="small" onClick={clearSelection}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}

          <ExpandMoreIcon
            sx={{
              fontSize: 20,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform .25s",
            }}
          />
        </div>
      </div>

      {/* dropdown */}

      <div
        className={`
          overflow-hidden
          transition-all
          duration-200
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
              const selected = multiple
                ? currentValue.includes(option.value)
                : currentValue === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  title={option.label}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-9 h-9 rounded-full border-2 cursor-pointer
                    transition-all duration-150
                    ${
                      selected
                        ? "border-blue-500 scale-110"
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
              const selected = multiple
                ? currentValue.includes(option.value)
                : currentValue === option.value;

              return (
                <Chip
                  key={option.value}
                  label={option.label}
                  clickable
                  color={selected ? "primary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => handleSelect(option.value)}
                  sx={{
                    height: 36,
                    width: "100%",
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