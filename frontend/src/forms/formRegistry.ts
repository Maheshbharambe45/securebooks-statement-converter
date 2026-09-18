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
  name: 'Bookkeeping Documents',
  title: 'Documents Required for Bookkeeping',
  description: 'Submit the documents and information required for your bookkeeping period.',
  status: 'ACTIVE',
  badgeText: 'Available',
  fields: [
    { id: 'clientName', label: 'Client Name', type: 'text', required: true, placeholder: 'e.g. ABC Ltd' },
    { id: 'period', label: 'Bookkeeping Period', type: 'date-range', required: true },
    { id: 'monthQuarter', label: 'Month / Quarter', type: 'month-quarter', required: true },
  ],
  categories: [
    {
      id: 'bank_statements',
      number: 1,
      title: '1. Bank Statements',
      uploadLabel: 'Upload Bank Statements',
    },
    {
      id: 'credit_cards',
      number: 2,
      title: '2. Credit Card Statements',
      uploadLabel: 'Upload Credit Card Statements',
    },
    {
      id: 'sales_invoices',
      number: 3,
      title: '3. Sales Invoices, Receipts & Payouts',
      uploadLabel: 'Upload Sales Invoices / Receipts / Payout Reports',
    },
    {
      id: 'purchase_bills',
      number: 4,
      title: '4. Purchase Bills',
      uploadLabel: 'Upload Purchase Bills / Supplier Invoices',
    },
    {
      id: 'expense_bills',
      number: 5,
      title: '5. Expense Bills & Receipts',
      uploadLabel: 'Upload Expense Bills / Receipts',
    },
    {
      id: 'expense_claims',
      number: 6,
      title: '6. Expense Claims',
      uploadLabel: 'Upload Expense Claims & Supporting Receipts',
    },
    {
      id: 'petty_cash',
      number: 7,
      title: '7. Petty Cash Expenses',
      uploadLabel: 'Upload Petty Cash Records / Receipts',
    },
    {
      id: 'payroll',
      number: 8,
      title: '8. Payroll Reports',
      uploadLabel: 'Upload FPS / EPS / Full Payment Summary / Employer Payment Summary / Payroll Reports',
    },
    {
      id: 'pension_reports',
      number: 9,
      title: '9. Workplace Pension Reports',
      uploadLabel: 'Upload Workplace Pension Reports',
    },
    {
      id: 'vat_records',
      number: 10,
      title: '10. VAT Records',
      uploadLabel: 'Upload VAT Records / VAT Reports / Supporting Documents',
    },
    {
      id: 'loans_hp',
      number: 11,
      title: '11. Loan / Hire Purchase Agreements',
      uploadLabel: 'Upload Loan / Hire Purchase Agreement & Statements',
    },
    {
      id: 'additional_docs',
      number: 12,
      title: 'Additional Notes for Bookkeeper',
      uploadLabel: 'Upload Any Other Relevant Documents',
    },
  ],
};

export const UPCOMING_FORMS_LIST: FormDefinition[] = [
  {
    id: 'vat-submission',
    name: 'VAT Submission',
    title: 'VAT Submission',
    description: 'Submit your VAT records and supporting documents.',
    status: 'COMING_SOON',
    badgeText: 'Coming Soon',
    fields: [],
    categories: [],
  },
  {
    id: 'payroll-submission',
    name: 'Payroll Submission',
    title: 'Payroll Submission',
    description: 'Submit payroll and employee-related records.',
    status: 'COMING_SOON',
    badgeText: 'Coming Soon',
    fields: [],
    categories: [],
  },
  {
    id: 'client-onboarding',
    name: 'Client Onboarding',
    title: 'Client Onboarding',
    description: 'Provide the information required to get started with Secure Books.',
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
