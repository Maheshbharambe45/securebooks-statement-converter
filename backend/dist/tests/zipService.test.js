"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const zipService_js_1 = require("../services/zip/zipService.js");
const formRegistry_js_1 = require("../forms/formRegistry.js");
const tempCleanup_js_1 = require("../services/cleanup/tempCleanup.js");
(0, node_test_1.describe)('ZipService Unit & Integration Tests', () => {
    (0, node_test_1.test)('sanitizeZipEntryName strips path traversal and unsafe characters', () => {
        node_assert_1.default.strictEqual((0, zipService_js_1.sanitizeZipEntryName)('../../../etc/passwd'), 'etc/passwd');
        node_assert_1.default.strictEqual((0, zipService_js_1.sanitizeZipEntryName)('C:\\Windows\\System32\\cmd.exe'), 'Windows/System32/cmd.exe');
        node_assert_1.default.strictEqual((0, zipService_js_1.sanitizeZipEntryName)('1. Bank Statements/../../secret.txt'), '1. Bank Statements/secret.txt');
    });
    (0, node_test_1.test)('ZipService builds single ZIP package with Client Details.txt metadata and category folders', async () => {
        const zipService = new zipService_js_1.ZipService();
        const subId = `test-zip-${Date.now()}`;
        const tempDir = (0, tempCleanup_js_1.ensureSubmissionTempDir)(subId);
        const pdfFile = path_1.default.join(tempDir, 'statement.pdf');
        fs_1.default.writeFileSync(pdfFile, Buffer.from('%PDF-1.4 Mock PDF Content'));
        const mockForm = (0, formRegistry_js_1.getFormConfig)('bookkeeping-documents');
        const options = {
            submissionId: subId,
            reference: 'SB-2026-ZIP1',
            formConfig: mockForm,
            fieldValues: {
                clientName: 'Zip Test Ltd',
                startDate: '01/04/2026',
                endDate: '30/04/2026',
                selectionType: 'Month',
                selectedPeriod: 'April 2026',
            },
            clientEmail: 'zip@example.com',
            categoryStatuses: {
                bank_statements: { status: 'has_documents', notes: 'Statement for April' },
                credit_cards: { status: 'na' },
            },
            additionalNotes: 'Urgent processing requested',
            files: [
                {
                    category: 'bank_statements',
                    originalName: 'april_bank_statement.pdf',
                    sanitizedName: 'april_bank_statement.pdf',
                    tempFilePath: pdfFile,
                    mimeType: 'application/pdf',
                    sizeBytes: 2000,
                },
            ],
            tempDir,
        };
        try {
            const zipPackage = await zipService.buildSubmissionZipPackages(options);
            node_assert_1.default.strictEqual(zipPackage.reference, 'SB-2026-ZIP1');
            node_assert_1.default.strictEqual(zipPackage.isMultiPart, false);
            node_assert_1.default.strictEqual(zipPackage.parts.length, 1);
            node_assert_1.default.ok(fs_1.default.existsSync(zipPackage.parts[0].zipPath));
            node_assert_1.default.strictEqual(zipPackage.parts[0].zipFilename, 'SecureBooks_Submission_SB-2026-ZIP1.zip');
            node_assert_1.default.ok(zipPackage.parts[0].sizeBytes > 0);
        }
        finally {
            (0, tempCleanup_js_1.cleanupSubmissionTempDir)(subId);
        }
    });
    (0, node_test_1.test)('ZipService preserves uploaded ZIP file inside submission ZIP without extracting', async () => {
        const zipService = new zipService_js_1.ZipService();
        const subId = `test-zip-inner-${Date.now()}`;
        const tempDir = (0, tempCleanup_js_1.ensureSubmissionTempDir)(subId);
        const uploadedZipFile = path_1.default.join(tempDir, 'client_uploaded.zip');
        fs_1.default.writeFileSync(uploadedZipFile, Buffer.from('PK\x03\x04Mock Uploaded Zip File Content'));
        const mockForm = (0, formRegistry_js_1.getFormConfig)('bookkeeping-documents');
        const options = {
            submissionId: subId,
            reference: 'SB-2026-ZIPINNER',
            formConfig: mockForm,
            fieldValues: { clientName: 'Inner Zip Ltd' },
            categoryStatuses: {},
            files: [
                {
                    category: 'bank_statements',
                    originalName: 'client_uploaded.zip',
                    sanitizedName: 'client_uploaded.zip',
                    tempFilePath: uploadedZipFile,
                    mimeType: 'application/zip',
                    sizeBytes: 3000,
                },
            ],
            tempDir,
        };
        try {
            const zipPackage = await zipService.buildSubmissionZipPackages(options);
            node_assert_1.default.strictEqual(zipPackage.parts.length, 1);
            node_assert_1.default.ok(fs_1.default.existsSync(zipPackage.parts[0].zipPath));
        }
        finally {
            (0, tempCleanup_js_1.cleanupSubmissionTempDir)(subId);
        }
    });
    (0, node_test_1.test)('ZipService partitions files into multi-part ZIP packages when file sizes exceed threshold', async () => {
        const zipService = new zipService_js_1.ZipService();
        const subId = `test-zip-multi-${Date.now()}`;
        const tempDir = (0, tempCleanup_js_1.ensureSubmissionTempDir)(subId);
        // Create two mock files larger than safe threshold (~7 MB each => 14 MB total)
        const file1 = path_1.default.join(tempDir, 'part1.pdf');
        const file2 = path_1.default.join(tempDir, 'part2.pdf');
        fs_1.default.writeFileSync(file1, Buffer.from('%PDF-1.4 File 1'));
        fs_1.default.writeFileSync(file2, Buffer.from('%PDF-1.4 File 2'));
        const mockForm = (0, formRegistry_js_1.getFormConfig)('bookkeeping-documents');
        const options = {
            submissionId: subId,
            reference: 'SB-2026-MULTI',
            formConfig: mockForm,
            fieldValues: { clientName: 'Multi Part Ltd' },
            categoryStatuses: {},
            files: [
                {
                    category: 'bank_statements',
                    originalName: 'part1.pdf',
                    sanitizedName: 'part1.pdf',
                    tempFilePath: file1,
                    mimeType: 'application/pdf',
                    sizeBytes: 7 * 1024 * 1024,
                },
                {
                    category: 'payroll',
                    originalName: 'part2.pdf',
                    sanitizedName: 'part2.pdf',
                    tempFilePath: file2,
                    mimeType: 'application/pdf',
                    sizeBytes: 7 * 1024 * 1024,
                },
            ],
            tempDir,
        };
        try {
            const zipPackage = await zipService.buildSubmissionZipPackages(options);
            node_assert_1.default.strictEqual(zipPackage.isMultiPart, true);
            node_assert_1.default.strictEqual(zipPackage.parts.length, 2);
            node_assert_1.default.strictEqual(zipPackage.parts[0].zipFilename, 'SecureBooks_Submission_SB-2026-MULTI_Part_1_of_2.zip');
            node_assert_1.default.strictEqual(zipPackage.parts[1].zipFilename, 'SecureBooks_Submission_SB-2026-MULTI_Part_2_of_2.zip');
        }
        finally {
            (0, tempCleanup_js_1.cleanupSubmissionTempDir)(subId);
        }
    });
});
