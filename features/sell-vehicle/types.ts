export type FormStepProps = {
  id: string;
  title: string;
  data: any;
  required: boolean;
  fields: string[];
  onNext?: () => void;
  updateField: (field: string, value: any) => void;
};

export type SectionConfig = {
  id: string;
  required?: boolean;
  fields: string[];
};