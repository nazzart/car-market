import { SectionConfig, findFirstInvalidSection } from "../utils/sectionUtils";

export const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

export const validateAndScroll = (
  sections: SectionConfig[],
  formData: Record<string, any>
) => {
  const invalidSection = findFirstInvalidSection(sections, formData);

  if (invalidSection) {
    scrollToSection(invalidSection.id);
    return false;
  }

  return true;
};
