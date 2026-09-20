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
    (0, node_test_1.test)('SesService generates raw MIME message buffer with ZIP attachment and headers', () => {
        const sesService = new sesService_js_1.SesService();
        const tempZipFile = path_1.default.join(os_1.default.tmpdir(), `ses-test-${Date.now()}.zip`);
        fs_1.default.writeFileSync(tempZipFile, Buffer.from('PK\x03\x04Mock ZIP File Content'));
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
                categoryStatuses: {},
                files: [],
            };
            const partInfo = {
                partIndex: 1,
                totalParts: 1,
                zipPath: tempZipFile,
                zipFilename: 'SecureBooks_Submission_SB-2026-TEST1234.zip',
                fileCount: 1,
                sizeBytes: 100,
            };
            const htmlBody = sesService.generatePartHtmlEmailBody(payload, partInfo);
            node_assert_1.default.ok(htmlBody.includes('SB-2026-TEST1234'));
            node_assert_1.default.ok(htmlBody.includes('Test Client Ltd'));
            node_assert_1.default.ok(htmlBody.includes('SecureBooks_Submission_SB-2026-TEST1234.zip'));
            const rawMimeBuffer = sesService.buildZipRawMimeMessage('mahesh_bharambe@outlook.com', 'mahesh_bharambe@outlook.com', 'Secure Books - Document Submission SB-2026-TEST1234', htmlBody, tempZipFile, 'SecureBooks_Submission_SB-2026-TEST1234.zip');
            const mimeString = rawMimeBuffer.toString('utf-8');
            node_assert_1.default.ok(mimeString.includes('From: mahesh_bharambe@outlook.com'));
            node_assert_1.default.ok(mimeString.includes('To: mahesh_bharambe@outlook.com'));
            node_assert_1.default.ok(mimeString.includes('Content-Type: multipart/mixed'));
            node_assert_1.default.ok(mimeString.includes('SecureBooks_Submission_SB-2026-TEST1234.zip'));
            node_assert_1.default.ok(mimeString.includes('Content-Transfer-Encoding: base64'));
        }
        finally {
            if (fs_1.default.existsSync(tempZipFile))
                fs_1.default.unlinkSync(tempZipFile);
        }
    });
    (0, node_test_1.test)('SesService sends ZIP submission email package in mock mode', async () => {
        process.env.MOCK_SES = 'true';
        const sesService = new sesService_js_1.SesService();
        const tempZipFile = path_1.default.join(os_1.default.tmpdir(), `ses-mock-${Date.now()}.zip`);
        fs_1.default.writeFileSync(tempZipFile, Buffer.from('PK\x03\x04Mock ZIP Content'));
        try {
            const mockForm = (0, formRegistry_js_1.getFormConfig)('bookkeeping-documents');
            const payload = {
                formConfig: mockForm,
                reference: 'SB-2026-MOCK9999',
                fieldValues: { clientName: 'Mock Client' },
                categoryStatuses: {},
                files: [],
            };
            const zipPackage = {
                reference: 'SB-2026-MOCK9999',
                isMultiPart: false,
                parts: [
                    {
                        partIndex: 1,
                        totalParts: 1,
                        zipPath: tempZipFile,
                        zipFilename: 'SecureBooks_Submission_SB-2026-MOCK9999.zip',
                        fileCount: 0,
                        sizeBytes: 100,
                    },
                ],
            };
            const res = await sesService.sendZipPackagesEmail(payload, zipPackage);
            node_assert_1.default.strictEqual(res.success, true);
            node_assert_1.default.strictEqual(res.mode, 'mock_ses');
            node_assert_1.default.ok(res.messageId?.includes('mock-ses-msg-1-'));
        }
        finally {
            if (fs_1.default.existsSync(tempZipFile))
                fs_1.default.unlinkSync(tempZipFile);
        }
    });
});
