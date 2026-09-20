"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const sesService_js_1 = require("../services/ses/sesService.js");
const formRegistry_js_1 = require("../forms/formRegistry.js");
(0, node_test_1.describe)('AWS SES Service Unit Tests', () => {
    (0, node_test_1.test)('SesService generates raw MIME message buffer with attachments and headers', () => {
        const sesService = new sesService_js_1.SesService();
        const tempFile = path_1.default.join(os_1.default.tmpdir(), `ses-test-${Date.now()}.pdf`);
        fs_1.default.writeFileSync(tempFile, Buffer.from('%PDF-1.4 Mock PDF Document'));
        try {
            const mockForm = (0, formRegistry_js_1.getFormConfig)('bookkeeping-documents');
            const payload = {
                formConfig: mockForm,
                reference: 'SB-2026-TEST1234',
                fieldValues: {
                    clientName: 'Test Client Ltd',
                    startDate: '01/04/2026',
                    endDate: '30/04/2026',
                    selectionType: 'Month',
                    selectedPeriod: 'April 2026',
                },
                clientEmail: 'client@example.com',
                categoryStatuses: {
                    bank_statements: { status: 'has_documents', notes: 'April bank statement' },
                    credit_cards: { status: 'na' },
                },
                additionalNotes: 'Please process urgently',
                files: [
                    {
                        category: 'bank_statements',
                        originalName: 'bank_statement_april.pdf',
                        sanitizedName: 'bank_statement_april.pdf',
                        tempFilePath: tempFile,
                        mimeType: 'application/pdf',
                        sizeBytes: 2500,
                    },
                ],
            };
            const htmlBody = sesService.generateHtmlEmailBody(payload);
            node_assert_1.default.ok(htmlBody.includes('SB-2026-TEST1234'));
            node_assert_1.default.ok(htmlBody.includes('Test Client Ltd'));
            node_assert_1.default.ok(htmlBody.includes('Status: AVAILABLE'));
            node_assert_1.default.ok(htmlBody.includes('bank_statement_april.pdf'));
            node_assert_1.default.ok(htmlBody.includes('Status: N/A'));
            const rawMimeBuffer = sesService.buildRawMimeMessage('mahesh_bharambe@outlook.com', 'mahesh_bharambe@outlook.com', 'Bookkeeping Documents Submission - Test Client Ltd - April 2026', htmlBody, payload.files);
            const mimeString = rawMimeBuffer.toString('utf-8');
            node_assert_1.default.ok(mimeString.includes('From: mahesh_bharambe@outlook.com'));
            node_assert_1.default.ok(mimeString.includes('To: mahesh_bharambe@outlook.com'));
            node_assert_1.default.ok(mimeString.includes('Content-Type: multipart/mixed'));
            node_assert_1.default.ok(mimeString.includes('bank_statement_april.pdf'));
            node_assert_1.default.ok(mimeString.includes('Content-Transfer-Encoding: base64'));
        }
        finally {
            if (fs_1.default.existsSync(tempFile))
                fs_1.default.unlinkSync(tempFile);
        }
    });
    (0, node_test_1.test)('SesService sends submission email in mock mode', async () => {
        process.env.MOCK_SES = 'true';
        const sesService = new sesService_js_1.SesService();
        const mockForm = (0, formRegistry_js_1.getFormConfig)('bookkeeping-documents');
        const res = await sesService.sendSubmissionEmail({
            formConfig: mockForm,
            reference: 'SB-2026-MOCK9999',
            fieldValues: { clientName: 'Mock Client' },
            categoryStatuses: {},
            files: [],
        });
        node_assert_1.default.strictEqual(res.success, true);
        node_assert_1.default.strictEqual(res.mode, 'mock_ses');
        node_assert_1.default.ok(res.messageId?.startsWith('mock-ses-msg-'));
    });
});
