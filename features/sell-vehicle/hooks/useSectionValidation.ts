import { FieldConfig, validateSection } from "../utils/sectionUtils";

export function useSectionValidation(
  fields: FieldConfig[],
  data: object
) {
  return validateSection(fields, data as Record<string, unknown>);
}
