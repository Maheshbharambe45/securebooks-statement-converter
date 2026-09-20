"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormConfig = getFormConfig;
exports.getAllForms = getAllForms;
exports.resolveFormRecipient = resolveFormRecipient;
exports.renderSubjectTemplate = renderSubjectTemplate;
const config_js_1 = require("./bookkeeping/config.js");
const config_js_2 = require("./vat/config.js");
const config_js_3 = require("./payroll/config.js");
const config_js_4 = require("./onboarding/config.js");
const registry = new Map([
    [config_js_1.bookkeepingFormConfig.id, config_js_1.bookkeepingFormConfig],
    [config_js_2.vatFormConfig.id, config_js_2.vatFormConfig],
    [config_js_3.payrollFormConfig.id, config_js_3.payrollFormConfig],
    [config_js_4.onboardingFormConfig.id, config_js_4.onboardingFormConfig],
]);
function getFormConfig(formId) {
    return registry.get(formId);
}
function getAllForms() {
    return Array.from(registry.values());
}
function resolveFormRecipient(config) {
    if (process.env.MAIL_TO && process.env.MAIL_TO.trim()) {
        return process.env.MAIL_TO.trim();
    }
    if (config.emailRecipientEnvVar && process.env[config.emailRecipientEnvVar]) {
        return process.env[config.emailRecipientEnvVar].trim();
    }
    return config.defaultRecipient;
}
function renderSubjectTemplate(config, data) {
    let subject = config.emailSubjectTemplate;
    for (const [key, value] of Object.entries(data)) {
        subject = subject.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
    }
    return subject;
}
