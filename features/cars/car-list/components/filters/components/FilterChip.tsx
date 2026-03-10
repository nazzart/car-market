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
        !bg-white 
        !border-gray-300 
        hover:!bg-gray-50
        !rounded-lg
      "
    />
  );
}
