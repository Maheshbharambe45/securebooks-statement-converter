export type FormStatus = 'ACTIVE' | 'COMING_SOON';

export interface FormCategoryConfig {
  id: string;
  name: string;
  uploadLabel: string;
  description?: string;
  maxFiles?: number;
  multerFieldName: string;
}

export interface FormFieldConfig {
  id: string;
  label: string;
  type: 'text' | 'date-range' | 'month-quarter' | 'email' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
}

export interface FormConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  status: FormStatus;
  emailRecipientEnvVar?: string;
  defaultRecipient: string;
  emailSubjectTemplate: string;
  fields: FormFieldConfig[];
  documentCategories: FormCategoryConfig[];
}
