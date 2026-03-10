"use client";

import { useState } from "react";
import BrandModelRow from "./BrandModelRow";

type Row = {
  id: number;
  brand: string;
  model: string;
};

export default function BrandModelSection() {
  const [rows, setRows] = useState<Row[]>([
    { id: Date.now(), brand: "", model: "" },
  ]);

  const addRow = () => {
    if (rows.length >= 2) return;

    setRows((prev) => [
      ...prev,
      { id: Date.now(), brand: "", model: "" },
    ]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const updateRow = (id: number, field: "brand" | "model", value: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  return (
    <div className="flex flex-col gap-3 mb-4">
      {rows.map((row, index) => (
        <BrandModelRow
          key={row.id}
          row={row}
          index={index}
          totalRows={rows.length}
          addRow={addRow}
          removeRow={removeRow}
          updateRow={updateRow}
        />
      ))}
    </div>
  );
}