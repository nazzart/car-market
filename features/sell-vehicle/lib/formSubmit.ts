import { isValid } from "../utils/sectionUtils";

type Section = {
  id: string;
  required?: boolean;
  fields: string[];
};

export const findFirstInvalidSection = (
  sections: Section[],
  formData: Record<string, any>
) => {
  return sections.find((section) => {
    if (!section.required) return false;

    const values = section.fields.map((f) => formData[f]);
    return !isValid(values);
  });
};

export const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

export const validateAndScroll = (
  sections: Section[],
  formData: Record<string, any>
) => {
  const invalidSection = findFirstInvalidSection(sections, formData);

  if (invalidSection) {
    scrollToSection(invalidSection.id);
    return false;
  }

  return true;
};