"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingFormConfig = void 0;
exports.onboardingFormConfig = {
    id: 'client-onboarding',
    name: 'Client Onboarding',
    title: 'Client Onboarding',
    description: 'Provide the information required to get started with Secure Books.',
    status: 'COMING_SOON',
    defaultRecipient: 'info@securebooks.co.uk',
    emailSubjectTemplate: 'Client Onboarding - {clientName}',
    fields: [{ id: 'clientName', label: 'Client Name', type: 'text', required: true }],
    documentCategories: [],
};
