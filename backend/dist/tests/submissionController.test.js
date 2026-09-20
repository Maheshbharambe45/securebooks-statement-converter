"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const submission_controller_js_1 = require("../controllers/submission.controller.js");
const tempCleanup_js_1 = require("../services/cleanup/tempCleanup.js");
(0, node_test_1.describe)('Submission Controller Multer Normalization & Submission Tests', () => {
    (0, node_test_1.test)('normalizeMulterFiles handles undefined and null safely', () => {
        node_assert_1.default.deepStrictEqual((0, submission_controller_js_1.normalizeMulterFiles)(undefined), []);
        node_assert_1.default.deepStrictEqual((0, submission_controller_js_1.normalizeMulterFiles)(null), []);
    });
    (0, node_test_1.test)('normalizeMulterFiles handles empty object dictionary', () => {
        node_assert_1.default.deepStrictEqual((0, submission_controller_js_1.normalizeMulterFiles)({}), []);
    });
    (0, node_test_1.test)('normalizeMulterFiles normalizes Multer upload.fields() object dictionary into flat array', () => {
        const mockFile1 = { fieldname: 'files_bank_statements', originalname: 'bank.pdf' };
        const mockFile2 = { fieldname: 'files_bank_statements', originalname: 'bank2.pdf' };
        const mockFile3 = { fieldname: 'files_payroll', originalname: 'payroll.pdf' };
        const fieldsDict = {
            files_bank_statements: [mockFile1, mockFile2],
            files_payroll: [mockFile3],
        };
        const normalized = (0, submission_controller_js_1.normalizeMulterFiles)(fieldsDict);
        node_assert_1.default.strictEqual(normalized.length, 3);
        node_assert_1.default.strictEqual(normalized[0].originalname, 'bank.pdf');
        node_assert_1.default.strictEqual(normalized[1].originalname, 'bank2.pdf');
        node_assert_1.default.strictEqual(normalized[2].originalname, 'payroll.pdf');
    });
    (0, node_test_1.test)('normalizeMulterFiles normalizes Multer upload.any() array into flat array', () => {
        const mockFile1 = { fieldname: 'files_bank_statements', originalname: 'bank.pdf' };
        const mockFile2 = { fieldname: 'files_payroll', originalname: 'payroll.pdf' };
        const filesArray = [mockFile1, mockFile2];
        const normalized = (0, submission_controller_js_1.normalizeMulterFiles)(filesArray);
        node_assert_1.default.strictEqual(normalized.length, 2);
        node_assert_1.default.strictEqual(normalized[0].originalname, 'bank.pdf');
        node_assert_1.default.strictEqual(normalized[1].originalname, 'payroll.pdf');
    });
    (0, node_test_1.test)('handleDocumentSubmission processes submission with Multer fields object dictionary, N/A categories, and cleans temp directory', async () => {
        process.env.MOCK_SES = 'true';
        const subId = `test-sub-multer-${Date.now()}`;
        const tempDir = (0, tempCleanup_js_1.ensureSubmissionTempDir)(subId);
        const pdfPath1 = path_1.default.join(tempDir, 'temp1.pdf');
        const pdfPath2 = path_1.default.join(tempDir, 'temp2.pdf');
        fs_1.default.writeFileSync(pdfPath1, Buffer.from('%PDF-1.4 Mock PDF 1'));
        fs_1.default.writeFileSync(pdfPath2, Buffer.from('%PDF-1.4 Mock PDF 2'));
        const mockReq = {
            params: { formId: 'bookkeeping-documents' },
            body: {
                submissionId: subId,
                clientName: 'Multer Test Ltd',
                startDate: '01/04/2026',
                endDate: '30/04/2026',
                selectionType: 'Month',
                selectedPeriod: 'April 2026',
                categoryStatuses: JSON.stringify({
                    bank_statements: { status: 'has_documents', notes: 'Monthly bank statement' },
                    credit_cards: { status: 'na' },
                }),
            },
            files: {
                files_bank_statements: [
                    {
                        fieldname: 'files_bank_statements',
                        originalname: 'statement1.pdf',
                        path: pdfPath1,
                        size: 1500,
                    },
                    {
                        fieldname: 'files_bank_statements',
                        originalname: 'statement2.pdf',
                        path: pdfPath2,
                        size: 1800,
                    },
                ],
            },
            ip: '127.0.0.1',
        };
        let statusCode = 0;
        let jsonResult = null;
        const mockRes = {
            status: (code) => {
                statusCode = code;
                return mockRes;
            },
            json: (data) => {
                jsonResult = data;
                return mockRes;
            },
        };
        try {
            await (0, submission_controller_js_1.handleDocumentSubmission)(mockReq, mockRes, () => { });
            node_assert_1.default.strictEqual(statusCode, 200);
            node_assert_1.default.strictEqual(jsonResult.success, true);
            node_assert_1.default.strictEqual(jsonResult.filesCount, 2);
            node_assert_1.default.ok(jsonResult.reference.startsWith('SB-2026-'));
            // Verify temporary directory cleanup after SES handoff
            node_assert_1.default.strictEqual(fs_1.default.existsSync(tempDir), false);
        }
        finally {
            (0, tempCleanup_js_1.cleanupSubmissionTempDir)(subId);
        }
    });
    (0, node_test_1.test)('handleDocumentSubmission processes submission with no uploaded files when all categories are N/A', async () => {
        process.env.MOCK_SES = 'true';
        const subId = `test-sub-nofiles-${Date.now()}`;
        const mockReq = {
            params: { formId: 'bookkeeping-documents' },
            body: {
                submissionId: subId,
                clientName: 'No Files Ltd',
                startDate: '01/04/2026',
                endDate: '30/04/2026',
                selectionType: 'Month',
                selectedPeriod: 'April 2026',
                categoryStatuses: JSON.stringify({
                    bank_statements: { status: 'na' },
                }),
            },
            files: undefined, // Multer returns undefined when no files uploaded
            ip: '127.0.0.1',
        };
        let statusCode = 0;
        let jsonResult = null;
        const mockRes = {
            status: (code) => {
                statusCode = code;
                return mockRes;
            },
            json: (data) => {
                jsonResult = data;
                return mockRes;
            },
        };
        await (0, submission_controller_js_1.handleDocumentSubmission)(mockReq, mockRes, () => { });
        node_assert_1.default.strictEqual(statusCode, 200);
        node_assert_1.default.strictEqual(jsonResult.success, true);
        node_assert_1.default.strictEqual(jsonResult.filesCount, 0);
    });
});
