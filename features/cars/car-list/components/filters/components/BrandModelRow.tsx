"use client";

import { TextField, MenuItem, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

type Row = {
  id: number;
  brand: string;
  model: string;
};

type Props = {
  row: Row;
  index: number;
  totalRows: number;
  addRow: () => void;
  removeRow: (id: number) => void;
  updateRow: (id: number, field: "brand" | "model", value: string) => void;
};

export default function BrandModelRow({
  row,
  index,
  totalRows,
  addRow,
  removeRow,
  updateRow,
}: Props) {
  const showAdd = index === totalRows - 1 && totalRows < 2;
  const showDelete = totalRows > 1;

  return (
    <div className="flex items-center gap-4">
      <TextField
        label="Марка"
        select
        size="small"
        className="w-[238px] !bg-white"
        value={row.brand}
        onChange={(e) => updateRow(row.id, "brand", e.target.value)}
      >
        <MenuItem value="">Любая</MenuItem>
        <MenuItem value="bmw">BMW</MenuItem>
        <MenuItem value="audi">Audi</MenuItem>
      </TextField>

      <TextField
        label="Модель"
        select
        size="small"
        className="w-[238px] !bg-white"
        value={row.model}
        onChange={(e) => updateRow(row.id, "model", e.target.value)}
      >
        <MenuItem value="">Любая</MenuItem>
        <MenuItem value="x5">X5</MenuItem>
        <MenuItem value="a6">A6</MenuItem>
      </TextField>

      {showAdd && (
        <IconButton onClick={addRow}>
          <AddIcon />
        </IconButton>
      )}

      {showDelete && (
        <IconButton onClick={() => removeRow(row.id)}>
          <DeleteIcon />
        </IconButton>
      )}
    </div>
  );
}
