"use client";

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useCarFilters } from "../hooks/useCarFilters";

const models = {
  bmw: ["x5", "x3", "m3"],
  audi: ["a4", "a6", "q7"],
  toyota: ["camry", "corolla"]
};

export default function ModelSelect() {
  const { params, updateFilter } = useCarFilters();

  const brand = params.get("brand") || "";
  const model = params.get("model") || "";

  const availableModels = models[brand as keyof typeof models] || [];

  return (
    <FormControl size="small" sx={{ minWidth: 280 }}>
      <InputLabel>Model</InputLabel>

      <Select
        value={model}
        label="Model"
        disabled={!brand}
        onChange={(e) => updateFilter("model", e.target.value)}
      >
        <MenuItem value="">All</MenuItem>

        {availableModels.map((m) => (
          <MenuItem key={m} value={m}>
            {m.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}