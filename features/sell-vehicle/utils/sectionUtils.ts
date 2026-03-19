import { SectionConfig } from "../types";

const isValueFilled = (v: any) => {
  if (Array.isArray(v)) return v.length > 0;
  return typeof v === "string" ? v.trim() !== "" : Boolean(v);
};

export const isFilled = (values: any[]) => {
  return values.some(isValueFilled);
};

export const isValid = (values: any[]) => {
  return values.every(isValueFilled);
};

export const isSectionValid = (
  fields: string[],
  data: Record<string, any>
) => {
  const values = fields.map((f) => data[f]);
  return isValid(values);
};

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

    const values = section.fields.map((f) => formData[f]);

    const filled = isFilled(values);
    const valid = isValid(values);

    state[section.id] = section.required ? valid : filled;
  }

  return state;
};