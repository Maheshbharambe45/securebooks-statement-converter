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
    // Create a mock PDF file buffer starting with %PDF-1.7
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
    // Create a mock buffer with Windows MZ executable magic bytes
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

  test('File validator rejects files exceeding configured max size limit', () => {
    const tempFilePath = path.join(os.tmpdir(), `test-large-${Date.now()}.pdf`);
    const pdfBuffer = Buffer.from('%PDF-1.4 header');
    fs.writeFileSync(tempFilePath, pdfBuffer);

    try {
      const filesToValidate = [
        {
          category: 'bank_statements',
          originalName: 'large_statement.pdf',
          tempPath: tempFilePath,
          sizeBytes: 30 * 1024 * 1024, // 30 MB (exceeds 25 MB max)
        },
      ];

      const result = validateUploadedFiles(filesToValidate, { maxFileSizeMb: 25, maxTotalUploadMb: 100 });
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.errors.length, 1);
      assert.match(result.errors[0], /exceeds the maximum allowed file size/i);
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
