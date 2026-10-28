import { validateField } from "./validationRules";

// Значения формы по имени поля (форма собирается из конфига секций)
type FormValues = Record<string, unknown>;

export type FieldConfig = {
  name: string;
  rules?: string[];
  defaultValue?: unknown;
};

export type SectionConfig = {
  id: string;
  required?: boolean;
  fields: FieldConfig[];
};

// 🧠 проверка одной секции
export const validateSection = (
  fields: FieldConfig[],
  data: FormValues
) => {
  const results = fields.map((field) => {
    const value = data[field.name];

    const isFilled = Array.isArray(value)
      ? value.length > 0
      : typeof value === "string"
      ? value.trim() !== ""
      : value && typeof value === "object"
      ? Object.keys(value).length > 0
      : Boolean(value);

    const isValid = validateField(value, field.rules);

    return { isFilled, isValid };
  });

  return {
    isValid: results.every((f) => f.isValid),
    isFilled: results.some((f) => f.isFilled),
  };
};

// 🧠 начальные значения формы из конфига секций
export const getInitialFormData = <T>(sections: SectionConfig[]): T => {
  const data: FormValues = {};


  for (const section of sections) {
    for (const field of section.fields) {
      data[field.name] = field.defaultValue ?? "";
    }
  }

  // конфиг секций описывает все поля формы — значит, объект соответствует T
  return data as T;
};

// 🧠 состояние всех секций (для sidebar)
export const getSectionsState = (
  sections: SectionConfig[],
  formData: FormValues
) => {
  const state: Record<string, boolean> = {};

  for (const section of sections) {
    if (!section.fields.length) {
      state[section.id] = false;
      continue;
    }

    const { isValid, isFilled } = validateSection(section.fields, formData);

    state[section.id] = section.required ? isValid : isFilled;
  }

  return state;
};

// 🔥 найти первую невалидную обязательную секцию (для submit)
export const findFirstInvalidSection = (
  sections: SectionConfig[],
  formData: FormValues
) => {
  return sections.find((section) => {
    if (!section.required) return false;

    const { isValid } = validateSection(section.fields, formData);

    return !isValid;
  });
};
