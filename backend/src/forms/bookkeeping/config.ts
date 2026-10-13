import { FormConfig } from '../types.js';

export const bookkeepingFormConfig: FormConfig = {
  id: 'bookkeeping-documents',
  name: 'Bookkeeping & VAT Documents',
  title: 'Bookkeeping & VAT Documents',
  description: 'Submit your bookkeeping and VAT documents securely to Secure Books.',
  status: 'ACTIVE',
  emailRecipientEnvVar: 'BOOKKEEPING_FORM_EMAIL',
  defaultRecipient: 'info@securebooks.co.uk',
  emailSubjectTemplate: 'Bookkeeping Documents Submission - {clientName} - {period}',
  fields: [
    {
      id: 'clientName',
      label: 'Client Name',
      type: 'text',
      required: true,
      placeholder: 'e.g. ABC Ltd',
    },
    {
      id: 'startDate',
      label: 'Start Date',
      type: 'text',
      required: false,
    },
    {
      id: 'endDate',
      label: 'End Date',
      type: 'text',
      required: false,
    },
    {
      id: 'selectionType',
      label: 'Selection Type (Month/Quarter)',
      type: 'text',
      required: false,
    },
    {
      id: 'selectedPeriod',
      label: 'Selected Month/Quarter',
      type: 'text',
      required: false,
    },
  ],
  documentCategories: [
    {
      id: 'bank_statements',
      name: '1. Bank Statements',
      uploadLabel: 'Upload Bank Statements',
      multerFieldName: 'files_bank_statements',
    },
    {
      id: 'sales_invoices',
      name: '2. Sales Invoices',
      uploadLabel: 'Upload Sales Invoices',
      multerFieldName: 'files_sales_invoices',
    },
    {
      id: 'purchase_bills',
      name: '3. Purchase Bills',
      uploadLabel: 'Upload Purchase Bills',
      multerFieldName: 'files_purchase_bills',
    },
    {
      id: 'other_documents',
      name: '4. Other Documents',
      uploadLabel: 'Upload Other Documents',
      multerFieldName: 'files_other_documents',
    },
    {
      id: 'additional_docs',
      name: '4. Other Documents',
      uploadLabel: 'Upload Other Documents',
      multerFieldName: 'files_additional_docs',
    },
  ],
};
