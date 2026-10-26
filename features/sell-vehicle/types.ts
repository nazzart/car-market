import { FieldConfig } from "./utils/sectionUtils";

export type FormStepProps = {
  id: string;
  title: string;
  data: any;
  required: boolean;
  fields: FieldConfig[];
  onNext?: () => void;
  updateField: (field: string, value: any) => void;
};
