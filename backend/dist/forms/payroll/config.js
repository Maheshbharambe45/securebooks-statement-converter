"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrollFormConfig = void 0;
exports.payrollFormConfig = {
    id: 'payroll-submission',
    name: 'Payroll Submission',
    title: 'Payroll Submission',
    description: 'Submit payroll and employee-related records.',
    status: 'COMING_SOON',
    defaultRecipient: 'info@securebooks.co.uk',
    emailSubjectTemplate: 'Payroll Submission - {clientName}',
    fields: [{ id: 'clientName', label: 'Client Name', type: 'text', required: true }],
    documentCategories: [],
};
