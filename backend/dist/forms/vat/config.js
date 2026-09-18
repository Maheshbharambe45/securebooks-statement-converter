"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vatFormConfig = void 0;
exports.vatFormConfig = {
    id: 'vat-submission',
    name: 'VAT Submission',
    title: 'VAT Submission',
    description: 'Submit your VAT records and supporting documents.',
    status: 'COMING_SOON',
    emailRecipientEnvVar: 'VAT_FORM_EMAIL',
    defaultRecipient: 'info@securebooks.co.uk',
    emailSubjectTemplate: 'VAT Submission - {clientName}',
    fields: [
        { id: 'clientName', label: 'Client Name', type: 'text', required: true },
        { id: 'vatRegistrationNumber', label: 'VAT Registration Number', type: 'text', required: true },
    ],
    documentCategories: [
        {
            id: 'vat_summary',
            name: 'VAT Summary',
            uploadLabel: 'Upload VAT Summary',
            multerFieldName: 'files_vat_summary',
        },
    ],
};
