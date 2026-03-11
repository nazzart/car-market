"use client";

import { Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type FilterChipProps = {
  label: string;
  onDelete?: () => void;
};

export default function FilterChip({ label, onDelete }: FilterChipProps) {
  return (
    <Chip
      label={label}
      onDelete={onDelete}
      deleteIcon={<CloseIcon />}
      variant="outlined"
      className="
      !bg-gray-100
        !border-gray-300 
        hover:!bg-gray-200
        !rounded-lg
      "
    />
  );
}
