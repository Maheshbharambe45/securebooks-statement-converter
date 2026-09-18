"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = __importDefault(require("node:test"));
const formRegistry_js_1 = require("../forms/formRegistry.js");
(0, node_test_1.default)('Form Registry Tests', async (t) => {
    await t.test('Registers initial forms correctly', () => {
        const forms = (0, formRegistry_js_1.getAllForms)();
        node_assert_1.default.strictEqual(forms.length >= 4, true);
        const bookkeeping = (0, formRegistry_js_1.getFormConfig)('bookkeeping-documents');
        node_assert_1.default.ok(bookkeeping);
        node_assert_1.default.strictEqual(bookkeeping?.name, 'Bookkeeping Documents');
        node_assert_1.default.strictEqual(bookkeeping?.status, 'ACTIVE');
        node_assert_1.default.strictEqual(bookkeeping?.documentCategories.length, 12);
        const vat = (0, formRegistry_js_1.getFormConfig)('vat-submission');
        node_assert_1.default.ok(vat);
        node_assert_1.default.strictEqual(vat?.name, 'VAT Submission');
        node_assert_1.default.strictEqual(vat?.status, 'COMING_SOON');
    });
    await t.test('Resolves recipient email strictly server-side', () => {
        const bookkeeping = (0, formRegistry_js_1.getFormConfig)('bookkeeping-documents');
        const recipient = (0, formRegistry_js_1.resolveFormRecipient)(bookkeeping);
        node_assert_1.default.strictEqual(typeof recipient, 'string');
        node_assert_1.default.strictEqual(recipient.length > 0, true);
    });
    await t.test('Renders dynamic email subject templates correctly', () => {
        const bookkeeping = (0, formRegistry_js_1.getFormConfig)('bookkeeping-documents');
        const subject = (0, formRegistry_js_1.renderSubjectTemplate)(bookkeeping, {
            clientName: 'ABC Ltd',
            period: '1 April 2026 - 30 April 2026',
        });
        node_assert_1.default.ok(subject.includes('ABC Ltd'));
        node_assert_1.default.ok(subject.includes('1 April 2026 - 30 April 2026'));
    });
});
