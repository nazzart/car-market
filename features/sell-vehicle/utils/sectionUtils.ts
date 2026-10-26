import { validateField } from "./validationRules";

export type FieldConfig = {
  name: string;
  rules?: string[];
};

export type SectionConfig = {
  id: string;
  required?: boolean;
  fields: FieldConfig[];
};

// 🧠 проверка одной секции
export const validateSection = (
  fields: FieldConfig[],
  data: Record<string, any>
) => {
  const results = fields.map((field) => {
    const value = data[field.name];

    const isFilled = Array.isArray(value)
      ? value.length > 0
      : typeof value === "string"
      ? value.trim() !== ""
      : Boolean(value);

    const isValid = validateField(value, field.rules);

    return { isFilled, isValid };
  });

  return {
    isValid: results.every((f) => f.isValid),
    isFilled: results.some((f) => f.isFilled),
  };
};

// 🧠 состояние всех секций (для sidebar)
export const getSectionsState = (
  sections: SectionConfig[],
  formData: Record<string, any>
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
  formData: Record<string, any>
) => {
  return sections.find((section) => {
    if (!section.required) return false;

    const { isValid } = validateSection(section.fields, formData);

    return !isValid;
  });
};
