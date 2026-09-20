"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const magicBytes_js_1 = require("../services/fileValidation/magicBytes.js");
const validator_js_1 = require("../services/fileValidation/validator.js");
const referenceGenerator_js_1 = require("../utils/referenceGenerator.js");
const securityScanner_js_1 = require("../services/malwareScan/securityScanner.js");
const tempCleanup_js_1 = require("../services/cleanup/tempCleanup.js");
(0, node_test_1.describe)('Secure Books Submission Portal Backend Tests', () => {
    (0, node_test_1.test)('Submission reference generator produces SB-2026-XXXX format', () => {
        const ref = (0, referenceGenerator_js_1.generateSubmissionReference)();
        node_assert_1.default.strictEqual(ref.startsWith('SB-2026-'), true);
        node_assert_1.default.strictEqual(ref.length, 16);
    });
    (0, node_test_1.test)('Magic bytes validation accepts valid PDF header', () => {
        const tempFilePath = path_1.default.join(os_1.default.tmpdir(), `test-pdf-${Date.now()}.pdf`);
        // Create a mock PDF file buffer starting with %PDF-1.7
        const pdfBuffer = Buffer.from('%PDF-1.7\n%Fake PDF content for testing\n');
        fs_1.default.writeFileSync(tempFilePath, pdfBuffer);
        try {
            const result = (0, magicBytes_js_1.validateMagicBytes)(tempFilePath, 'sample_bank_statement.pdf');
            node_assert_1.default.strictEqual(result.isValid, true);
            node_assert_1.default.strictEqual(result.detectedType, 'application/pdf');
        }
        finally {
            if (fs_1.default.existsSync(tempFilePath))
                fs_1.default.unlinkSync(tempFilePath);
        }
    });
    (0, node_test_1.test)('Magic bytes validation rejects fake PDF containing executable binary magic bytes', () => {
        const tempFilePath = path_1.default.join(os_1.default.tmpdir(), `test-fake-exe-${Date.now()}.pdf`);
        // Create a mock buffer with Windows MZ executable magic bytes
        const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
        fs_1.default.writeFileSync(tempFilePath, exeBuffer);
        try {
            const result = (0, magicBytes_js_1.validateMagicBytes)(tempFilePath, 'invoice.pdf');
            node_assert_1.default.strictEqual(result.isValid, false);
            node_assert_1.default.match(result.error || '', /Executable binary/i);
        }
        finally {
            if (fs_1.default.existsSync(tempFilePath))
                fs_1.default.unlinkSync(tempFilePath);
        }
    });
    (0, node_test_1.test)('File validator rejects files exceeding configured max size limit', () => {
        const tempFilePath = path_1.default.join(os_1.default.tmpdir(), `test-large-${Date.now()}.pdf`);
        const pdfBuffer = Buffer.from('%PDF-1.4 header');
        fs_1.default.writeFileSync(tempFilePath, pdfBuffer);
        try {
            const filesToValidate = [
                {
                    category: 'bank_statements',
                    originalName: 'large_statement.pdf',
                    tempPath: tempFilePath,
                    sizeBytes: 30 * 1024 * 1024, // 30 MB (exceeds 25 MB max)
                },
            ];
            const result = (0, validator_js_1.validateUploadedFiles)(filesToValidate, { maxFileSizeMb: 25, maxTotalUploadMb: 25 });
            node_assert_1.default.strictEqual(result.isValid, false);
            node_assert_1.default.ok(result.errors.length >= 1);
            node_assert_1.default.match(result.errors[0], /exceeds/i);
        }
        finally {
            if (fs_1.default.existsSync(tempFilePath))
                fs_1.default.unlinkSync(tempFilePath);
        }
    });
    (0, node_test_1.test)('Security scanner flags double extension threats (.pdf.exe)', async () => {
        const tempFilePath = path_1.default.join(os_1.default.tmpdir(), `test-double-ext-${Date.now()}.pdf.exe`);
        fs_1.default.writeFileSync(tempFilePath, Buffer.from('test content'));
        try {
            const scanResult = await (0, securityScanner_js_1.scanFileForMalware)(tempFilePath, 'bank_statement.pdf.exe');
            node_assert_1.default.strictEqual(scanResult.isClean, false);
            node_assert_1.default.match(scanResult.reason || '', /forbidden executable extension/i);
        }
        finally {
            if (fs_1.default.existsSync(tempFilePath))
                fs_1.default.unlinkSync(tempFilePath);
        }
    });
    (0, node_test_1.test)('Temporary directory cleanup hard-deletes files and directory', () => {
        const testSubId = `test-sub-id-${Date.now()}`;
        const dirPath = (0, tempCleanup_js_1.ensureSubmissionTempDir)(testSubId);
        const dummyFilePath = path_1.default.join(dirPath, 'upload-temp.pdf');
        fs_1.default.writeFileSync(dummyFilePath, Buffer.from('%PDF-1.4 test'));
        node_assert_1.default.strictEqual(fs_1.default.existsSync(dummyFilePath), true);
        (0, tempCleanup_js_1.cleanupSubmissionTempDir)(testSubId);
        node_assert_1.default.strictEqual(fs_1.default.existsSync(dirPath), false);
        node_assert_1.default.strictEqual(fs_1.default.existsSync(dummyFilePath), false);
    });
});
