import assert from 'node:assert';
import test from 'node:test';
import { getFormConfig, getAllForms, resolveFormRecipient, renderSubjectTemplate } from '../forms/formRegistry.js';

test('Form Registry Tests', async (t) => {
  await t.test('Registers initial forms correctly', () => {
    const forms = getAllForms();
    assert.strictEqual(forms.length >= 4, true);

    const bookkeeping = getFormConfig('bookkeeping-documents');
    assert.ok(bookkeeping);
    assert.strictEqual(bookkeeping?.name, 'Bookkeeping Documents');
    assert.strictEqual(bookkeeping?.status, 'ACTIVE');
    assert.strictEqual(bookkeeping?.documentCategories.length, 12);

    const vat = getFormConfig('vat-submission');
    assert.ok(vat);
    assert.strictEqual(vat?.name, 'VAT Submission');
    assert.strictEqual(vat?.status, 'COMING_SOON');
  });

  await t.test('Resolves recipient email strictly server-side', () => {
    const bookkeeping = getFormConfig('bookkeeping-documents')!;
    const recipient = resolveFormRecipient(bookkeeping);
    assert.strictEqual(typeof recipient, 'string');
    assert.strictEqual(recipient.length > 0, true);
  });

  await t.test('Renders dynamic email subject templates correctly', () => {
    const bookkeeping = getFormConfig('bookkeeping-documents')!;
    const subject = renderSubjectTemplate(bookkeeping, {
      clientName: 'ABC Ltd',
      period: '1 April 2026 - 30 April 2026',
    });

    assert.ok(subject.includes('ABC Ltd'));
    assert.ok(subject.includes('1 April 2026 - 30 April 2026'));
  });
});
