"use client";

import { Stack, TextField } from "@mui/material";
import { useCarFilters } from "../hooks/useCarFilters";

export default function PriceInputs() {
  const { params, updateFilter } = useCarFilters();

  return (
    <Stack direction="row" spacing={1}>
      <TextField
        size="small"
        placeholder="Price from"
        value={params.get("priceFrom") || ""}
        onChange={(e) => updateFilter("priceFrom", e.target.value)}
      />

      <TextField
        size="small"
        placeholder="Price to"
        value={params.get("priceTo") || ""}
        onChange={(e) => updateFilter("priceTo", e.target.value)}
      />
    </Stack>
  );
}
