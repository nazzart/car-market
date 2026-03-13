export type ChipOption = {
  label: string;
  value: string;
  color?: string;
};

export type ChipSelectProps = {
  label: string;
  options: ChipOption[];
  value?: string | string[] | null;
  onChange: (value: any) => void;
  multiple?: boolean;
  placeholder?: string;
  variant?: "chip" | "color";
  clearable?: boolean;
  disableUnselect?: boolean;
};
