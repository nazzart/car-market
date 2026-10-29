import type { ReactNode } from "react";

import type { Listing } from "@/features/cars/types";

// Строка таблицы сравнения: что показать, по какому значению сравнивать и где «лучше» — меньше или больше
export type CompareRow = {
  key: string;
  label: string;
  display: (l: Listing) => ReactNode;
  // значение для поиска лучшего и сравнения «есть ли отличия»
  value: (l: Listing) => string | number | undefined;
  best?: "min" | "max";
};

export type CompareSection = { key: string; title: string; rows: CompareRow[] };
