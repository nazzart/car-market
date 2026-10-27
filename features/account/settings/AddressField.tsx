"use client";

import { useEffect, useRef, useState } from "react";
import { Autocomplete, CircularProgress, InputAdornment, TextField } from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

import { AddressResult, searchAddress } from "./geocoding";

const MIN_QUERY = 3;
const DEBOUNCE_MS = 300;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: AddressResult) => void;
  near: { lat: number; lng: number };
  label: string;
  placeholder?: string;
  error?: boolean;
  helperText?: React.ReactNode;
};

// Поле адреса с подсказками геокодера; можно и просто ввести адрес руками
export default function AddressField({ value, onChange, onSelect, near, label, placeholder, error, helperText }: Props) {
  const [options, setOptions] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const request = useRef<AbortController>(undefined);

  const cancel = () => {
    clearTimeout(timer.current);
    request.current?.abort();
  };

  useEffect(() => cancel, []);

  const search = (text: string) => {
    cancel();

    if (text.trim().length < MIN_QUERY) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timer.current = setTimeout(async () => {
      const controller = new AbortController();
      request.current = controller;

      try {
        setOptions(await searchAddress(text, near, controller.signal));
      } catch {
        if (!controller.signal.aborted) setOptions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);
  };

  return (
    <Autocomplete<AddressResult, false, false, true>
      freeSolo
      value={null}
      options={options}
      filterOptions={(x) => x}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
      getOptionKey={(option) => (typeof option === "string" ? option : option.id)}
      inputValue={value}
      onInputChange={(_, text, reason) => {
        if (reason === "input" || reason === "clear") {
          onChange(text);
          search(text);
        }
      }}
      onChange={(_, option) => {
        if (option && typeof option !== "string") {
          cancel();
          setLoading(false);
          onSelect(option);
        }
      }}
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <div className="flex items-start gap-3 py-0.5">
            <PlaceOutlinedIcon className="text-gray-400 mt-0.5" sx={{ fontSize: 20 }} />
            <div>
              <div className="font-medium text-gray-900">{option.street}</div>
              <div className="text-xs text-gray-500">
                {[option.city, option.postcode].filter(Boolean).join(", ")}
              </div>
            </div>
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          required
          slotProps={{
            htmlInput: { ...params.inputProps, lang: "lv", autoComplete: "off" },
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[11px] font-semibold text-gray-600">LV</span>
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading && <CircularProgress size={18} className="mr-1" />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
