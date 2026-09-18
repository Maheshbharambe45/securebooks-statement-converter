"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookkeepingFormConfig = void 0;
exports.bookkeepingFormConfig = {
    id: 'bookkeeping-documents',
    name: 'Bookkeeping Documents',
    title: 'Documents Required for Bookkeeping',
    description: 'Submit the documents and information required for your bookkeeping period.',
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
            required: true,
        },
        {
            id: 'endDate',
            label: 'End Date',
            type: 'text',
            required: true,
        },
        {
            id: 'selectionType',
            label: 'Selection Type (Month/Quarter)',
            type: 'text',
            required: true,
        },
        {
            id: 'selectedPeriod',
            label: 'Selected Month/Quarter',
            type: 'text',
            required: true,
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
            id: 'credit_cards',
            name: '2. Credit Card Statements',
            uploadLabel: 'Upload Credit Card Statements',
            multerFieldName: 'files_credit_cards',
        },
        {
            id: 'sales_invoices',
            name: '3. Sales Invoices, Receipts & Payouts',
            uploadLabel: 'Upload Sales Invoices / Receipts / Payout Reports',
            multerFieldName: 'files_sales_invoices',
        },
        {
            id: 'purchase_bills',
            name: '4. Purchase Bills',
            uploadLabel: 'Upload Purchase Bills / Supplier Invoices',
            multerFieldName: 'files_purchase_bills',
        },
        {
            id: 'expense_bills',
            name: '5. Expense Bills & Receipts',
            uploadLabel: 'Upload Expense Bills / Receipts',
            multerFieldName: 'files_expense_bills',
        },
        {
            id: 'expense_claims',
            name: '6. Expense Claims',
            uploadLabel: 'Upload Expense Claims & Supporting Receipts',
            multerFieldName: 'files_expense_claims',
        },
        {
            id: 'petty_cash',
            name: '7. Petty Cash Expenses',
            uploadLabel: 'Upload Petty Cash Records / Receipts',
            multerFieldName: 'files_petty_cash',
        },
        {
            id: 'payroll',
            name: '8. Payroll Reports',
            uploadLabel: 'Upload FPS / EPS / Full Payment Summary / Employer Payment Summary / Payroll Reports',
            multerFieldName: 'files_payroll',
        },
        {
            id: 'pension_reports',
            name: '9. Workplace Pension Reports',
            uploadLabel: 'Upload Workplace Pension Reports',
            multerFieldName: 'files_pension_reports',
        },
        {
            id: 'vat_records',
            name: '10. VAT Records',
            uploadLabel: 'Upload VAT Records / VAT Reports / Supporting Documents',
            multerFieldName: 'files_vat_records',
        },
        {
            id: 'loans_hp',
            name: '11. Loan / Hire Purchase Agreements',
            uploadLabel: 'Upload Loan / Hire Purchase Agreement & Statements',
            multerFieldName: 'files_loans_hp',
        },
        {
            id: 'additional_docs',
            name: 'Additional Notes for Bookkeeper',
            uploadLabel: 'Upload Any Other Relevant Documents',
            multerFieldName: 'files_additional_docs',
        },
    ],
};
