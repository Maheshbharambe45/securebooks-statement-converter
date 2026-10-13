export type FormStatus = 'ACTIVE' | 'COMING_SOON';

export interface FormCategoryDefinition {
  id: string;
  number?: number;
  title: string;
  uploadLabel: string;
  description?: string;
  notesLabel?: string;
  supportedFormats?: string[];
  allowsMultiple?: boolean;
  allowsNA?: boolean;
}

export interface ClientFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'date-range' | 'month-quarter' | 'email';
  required: boolean;
  placeholder?: string;
}

export interface FormDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  status: FormStatus;
  badgeText: string;
  fields: ClientFieldDefinition[];
  categories: FormCategoryDefinition[];
}

export const BOOKKEEPING_FORM: FormDefinition = {
  id: 'bookkeeping-documents',
  name: 'Bookkeeping & VAT Documents',
  title: 'Bookkeeping & VAT Documents',
  description: 'Submit your bookkeeping and VAT documents securely to Secure Books.',
  status: 'ACTIVE',
  badgeText: 'Available',
  fields: [
    { id: 'clientName', label: 'Client Name', type: 'text', required: true, placeholder: 'e.g. ABC Ltd' },
  ],
  categories: [
    {
      id: 'bank_statements',
      number: 1,
      title: '1. Bank Statements',
      uploadLabel: 'Upload Bank Statements',
    },
    {
      id: 'sales_invoices',
      number: 2,
      title: '2. Sales Invoices',
      uploadLabel: 'Upload Sales Invoices',
    },
    {
      id: 'purchase_bills',
      number: 3,
      title: '3. Purchase Bills',
      uploadLabel: 'Upload Purchase Bills',
    },
    {
      id: 'other_documents',
      number: 4,
      title: '4. Other Documents',
      uploadLabel: 'Upload Other Documents',
      notesLabel: 'Notes for Bookkeeper',
    },
  ],
};

export const UPCOMING_FORMS_LIST: FormDefinition[] = [
  {
    id: 'management-accounts',
    name: 'Management Accounts',
    title: 'Management Accounts',
    description: 'Management accounts document submission and reporting.',
    status: 'COMING_SOON',
    badgeText: 'Coming Soon',
    fields: [],
    categories: [],
  },
  {
    id: 'year-end-accounts',
    name: 'Year-End Accounts',
    title: 'Year-End Accounts',
    description: 'Year-end accounting records and financial statements submission.',
    status: 'COMING_SOON',
    badgeText: 'Coming Soon',
    fields: [],
    categories: [],
  },
  {
    id: 'self-assessment',
    name: 'Self Assessment',
    title: 'Self Assessment',
    description: 'Personal tax return and self-assessment supporting documents.',
    status: 'COMING_SOON',
    badgeText: 'Coming Soon',
    fields: [],
    categories: [],
  },
  {
    id: 'payroll-cis',
    name: 'Payroll & CIS',
    title: 'Payroll & CIS',
    description: 'Payroll summaries, CIS vouchers, and employee records.',
    status: 'COMING_SOON',
    badgeText: 'Coming Soon',
    fields: [],
    categories: [],
  },
];

export const ALL_FORMS_LIST: FormDefinition[] = [
  BOOKKEEPING_FORM,
  ...UPCOMING_FORMS_LIST,
];

export function getFormDefinition(formId: string): FormDefinition | undefined {
  return ALL_FORMS_LIST.find((f) => f.id === formId);
}
