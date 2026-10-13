import { FormCategoryDefinition } from '../types';

export const DOCUMENT_CATEGORIES: FormCategoryDefinition[] = [
  {
    id: 'bank_statements',
    number: 1,
    title: 'Bank Statements',
    description: 'Upload PDF, Excel, or CSV bank statements.',
    uploadLabel: 'Upload Bank Statements',
    supportedFormats: ['PDF', 'JPG', 'JPEG', 'PNG', 'WEBP', 'XLS', 'XLSX', 'CSV', 'ZIP'],
    allowsMultiple: true,
    allowsNA: true,
  },
  {
    id: 'sales_invoices',
    number: 2,
    title: 'Sales Invoices',
    description: 'Upload sales invoices, receipts, and payout reports.',
    uploadLabel: 'Upload Sales Invoices',
    supportedFormats: ['PDF', 'JPG', 'JPEG', 'PNG', 'WEBP', 'XLS', 'XLSX', 'CSV', 'ZIP'],
    allowsMultiple: true,
    allowsNA: true,
  },
  {
    id: 'purchase_bills',
    number: 3,
    title: 'Purchase Bills',
    description: 'Upload supplier invoices, purchase bills, and trade accounts payable records.',
    uploadLabel: 'Upload Purchase Bills',
    supportedFormats: ['PDF', 'JPG', 'JPEG', 'PNG', 'WEBP', 'XLS', 'XLSX', 'CSV', 'ZIP'],
    allowsMultiple: true,
    allowsNA: true,
  },
  {
    id: 'other_documents',
    number: 4,
    title: 'Other Documents',
    description: 'Upload any other relevant accounting, tax, or legal documents for your bookkeeper.',
    uploadLabel: 'Upload Other Documents',
    notesLabel: 'Notes for Bookkeeper',
    supportedFormats: ['PDF', 'JPG', 'JPEG', 'PNG', 'WEBP', 'XLS', 'XLSX', 'CSV', 'ZIP'],
    allowsMultiple: true,
    allowsNA: true,
    exampleNotes: 'Add any notes or explanations for your bookkeeper here.',
  },
];

