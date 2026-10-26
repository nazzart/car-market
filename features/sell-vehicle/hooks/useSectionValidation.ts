import { FieldConfig, validateSection } from "../utils/sectionUtils";

export function useSectionValidation(
  fields: FieldConfig[],
  data: Record<string, any>
) {
  return validateSection(fields, data);
}
