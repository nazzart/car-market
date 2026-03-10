"use client";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useCarFilters } from "../hooks/useCarFilters";

export default function TransmissionToggle() {
  const { params, updateFilter } = useCarFilters();

  const value = params.get("transmission");

  return (
    <ToggleButtonGroup
      size="small"
      value={value}
      exclusive
      onChange={(e, v) => updateFilter("transmission", v)}
    >
      <ToggleButton value="auto">Auto</ToggleButton>
      <ToggleButton value="manual">Manual</ToggleButton>
    </ToggleButtonGroup>
  );
}
