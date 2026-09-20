import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { validateMagicBytes } from '../services/fileValidation/magicBytes.js';
import { validateUploadedFiles } from '../services/fileValidation/validator.js';
import { generateSubmissionReference } from '../utils/referenceGenerator.js';
import { scanFileForMalware } from '../services/malwareScan/securityScanner.js';
import { ensureSubmissionTempDir, cleanupSubmissionTempDir } from '../services/cleanup/tempCleanup.js';

describe('Secure Books Submission Portal Backend Tests', () => {
  test('Submission reference generator produces SB-2026-XXXX format', () => {
    const ref = generateSubmissionReference();
    assert.strictEqual(ref.startsWith('SB-2026-'), true);
    assert.strictEqual(ref.length, 16);
  });

  test('Magic bytes validation accepts valid PDF header', () => {
    const tempFilePath = path.join(os.tmpdir(), `test-pdf-${Date.now()}.pdf`);
    const pdfBuffer = Buffer.from('%PDF-1.7\n%Fake PDF content for testing\n');
    fs.writeFileSync(tempFilePath, pdfBuffer);

    try {
      const result = validateMagicBytes(tempFilePath, 'sample_bank_statement.pdf');
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.detectedType, 'application/pdf');
    } finally {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  });

  test('Magic bytes validation rejects fake PDF containing executable binary magic bytes', () => {
    const tempFilePath = path.join(os.tmpdir(), `test-fake-exe-${Date.now()}.pdf`);
    const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    fs.writeFileSync(tempFilePath, exeBuffer);

    try {
      const result = validateMagicBytes(tempFilePath, 'invoice.pdf');
      assert.strictEqual(result.isValid, false);
      assert.match(result.error || '', /Executable binary/i);
    } finally {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  });

  test('File validator accepts total submission upload up to 70 MB limit', () => {
    const tempFilePath = path.join(os.tmpdir(), `test-valid-70mb-${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, Buffer.from('%PDF-1.4 header'));

    try {
      const filesToValidate = [
        {
          category: 'bank_statements',
          originalName: 'valid_statement.pdf',
          tempPath: tempFilePath,
          sizeBytes: 20 * 1024 * 1024, // 20 MB (below 70 MB limit)
        },
      ];

      const result = validateUploadedFiles(filesToValidate, { maxFileSizeMb: 25, maxTotalUploadMb: 70 });
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
    } finally {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  });

  test('File validator rejects total submission upload above 70 MB limit', () => {
    const tempFilePath = path.join(os.tmpdir(), `test-over-70mb-${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, Buffer.from('%PDF-1.4 header'));

    try {
      const filesToValidate = [
        { category: 'bank_statements', originalName: 'file1.pdf', tempPath: tempFilePath, sizeBytes: 20 * 1024 * 1024 },
        { category: 'bank_statements', originalName: 'file2.pdf', tempPath: tempFilePath, sizeBytes: 20 * 1024 * 1024 },
        { category: 'bank_statements', originalName: 'file3.pdf', tempPath: tempFilePath, sizeBytes: 20 * 1024 * 1024 },
        { category: 'bank_statements', originalName: 'file4.pdf', tempPath: tempFilePath, sizeBytes: 20 * 1024 * 1024 },
      ]; // Total: 80 MB (above 70 MB limit, each 20 MB <= 25 MB max per file)

      const result = validateUploadedFiles(filesToValidate, { maxFileSizeMb: 25, maxTotalUploadMb: 70 });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.length >= 1);
      assert.match(result.errors.join(' '), /exceed the maximum submission size of 70 MB/i);
    } finally {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  });

  test('Security scanner flags double extension threats (.pdf.exe)', async () => {
    const tempFilePath = path.join(os.tmpdir(), `test-double-ext-${Date.now()}.pdf.exe`);
    fs.writeFileSync(tempFilePath, Buffer.from('test content'));

    try {
      const scanResult = await scanFileForMalware(tempFilePath, 'bank_statement.pdf.exe');
      assert.strictEqual(scanResult.isClean, false);
      assert.match(scanResult.reason || '', /forbidden executable extension/i);
    } finally {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  });

  test('Temporary directory cleanup hard-deletes files and directory', () => {
    const testSubId = `test-sub-id-${Date.now()}`;
    const dirPath = ensureSubmissionTempDir(testSubId);
    const dummyFilePath = path.join(dirPath, 'upload-temp.pdf');
    fs.writeFileSync(dummyFilePath, Buffer.from('%PDF-1.4 test'));

    assert.strictEqual(fs.existsSync(dummyFilePath), true);

    cleanupSubmissionTempDir(testSubId);

    assert.strictEqual(fs.existsSync(dirPath), false);
    assert.strictEqual(fs.existsSync(dummyFilePath), false);
  });
});
