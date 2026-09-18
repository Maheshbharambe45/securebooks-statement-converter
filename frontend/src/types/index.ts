export type CategoryStatus = 'has_documents' | 'na';
export type FormStatus = 'ACTIVE' | 'COMING_SOON';

export interface CategoryState {
  status: CategoryStatus;
  notes: string;
  files: File[];
}

export interface ClientFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'date-range' | 'month-quarter' | 'email' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  example?: string;
}

export interface FormCategoryDefinition {
  id: string;
  number?: number;
  title: string;
  uploadLabel?: string;
  description?: string;
  notesLabel?: string;
  supportedFormats?: string[];
  allowsMultiple?: boolean;
  allowsNA?: boolean;
  exampleNotes?: string;
  multerFieldName?: string;
}

export interface FormDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  status: FormStatus;
  badgeText?: string;
  fields: ClientFieldDefinition[];
  categories: FormCategoryDefinition[];
}

export interface ClientInfo {
  clientName: string;
  bookkeepingPeriod: string;
  monthQuarter: string;
  clientEmail: string;
  [key: string]: string;
}

export interface SubmissionResponse {
  success: boolean;
  message?: string;
  reference?: string;
  submittedAt?: string;
  filesCount?: number;
  error?: string;
  details?: string[];
}

export interface UploadProgressStage {
  stage: 'validating' | 'security' | 'graph_session' | 'sending' | 'completed' | 'error';
  label: string;
  percentage: number;
}
