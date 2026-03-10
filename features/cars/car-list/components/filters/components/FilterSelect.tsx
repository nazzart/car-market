"use client";

import { TextField, MenuItem } from "@mui/material";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  options: Option[];
};

export default function FilterSelect({ label, options }: Props) {
  return (
    <TextField label={label} select fullWidth size="small"  className="!bg-white rounded-lg">
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
