export type ChipOption = {
  label: string;
  value: string;
  color?: string;
};

export type ChipSelectProps = {
  label: string;
  options: ChipOption[];
  value?: string | string[] | null;
  // одиночный выбор — строка или null (снят), мультивыбор — массив
  onChange: (value: string | string[] | null) => void;
  multiple?: boolean;
  placeholder?: string;
  variant?: "chip" | "color";
  clearable?: boolean;
  disableUnselect?: boolean;
  required?: boolean;
  error?: boolean;
  // показать варианты сразу (для коротких списков), без выпадающего поля
  inline?: boolean;
};
