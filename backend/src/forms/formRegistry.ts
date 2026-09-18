import { FormConfig } from './types.js';
import { bookkeepingFormConfig } from './bookkeeping/config.js';
import { vatFormConfig } from './vat/config.js';
import { payrollFormConfig } from './payroll/config.js';
import { onboardingFormConfig } from './onboarding/config.js';

const registry: Map<string, FormConfig> = new Map([
  [bookkeepingFormConfig.id, bookkeepingFormConfig],
  [vatFormConfig.id, vatFormConfig],
  [payrollFormConfig.id, payrollFormConfig],
  [onboardingFormConfig.id, onboardingFormConfig],
]);

export function getFormConfig(formId: string): FormConfig | undefined {
  return registry.get(formId);
}

export function getAllForms(): FormConfig[] {
  return Array.from(registry.values());
}

export function resolveFormRecipient(config: FormConfig): string {
  if (config.emailRecipientEnvVar && process.env[config.emailRecipientEnvVar]) {
    return process.env[config.emailRecipientEnvVar]!.trim();
  }
  if (process.env.OUTLOOK_RECIPIENT && process.env.OUTLOOK_RECIPIENT.trim()) {
    return process.env.OUTLOOK_RECIPIENT.trim();
  }
  return config.defaultRecipient;
}

export function renderSubjectTemplate(config: FormConfig, data: Record<string, string>): string {
  let subject = config.emailSubjectTemplate;
  for (const [key, value] of Object.entries(data)) {
    subject = subject.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
  }
  return subject;
}
