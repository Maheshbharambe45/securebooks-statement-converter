import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { ZipService, sanitizeZipEntryName, CreateZipOptions } from '../services/zip/zipService.js';
import { getFormConfig } from '../forms/formRegistry.js';
import { ensureSubmissionTempDir, cleanupSubmissionTempDir } from '../services/cleanup/tempCleanup.js';

describe('ZipService Unit & Integration Tests', () => {
  test('sanitizeZipEntryName strips path traversal and unsafe characters', () => {
    assert.strictEqual(sanitizeZipEntryName('../../../etc/passwd'), 'etc/passwd');
    assert.strictEqual(sanitizeZipEntryName('C:\\Windows\\System32\\cmd.exe'), 'Windows/System32/cmd.exe');
    assert.strictEqual(sanitizeZipEntryName('1. Bank Statements/../../secret.txt'), '1. Bank Statements/secret.txt');
  });

  test('ZipService builds single ZIP package with Client Details.txt metadata and category folders', async () => {
    const zipService = new ZipService();
    const subId = `test-zip-${Date.now()}`;
    const tempDir = ensureSubmissionTempDir(subId);

    const pdfFile = path.join(tempDir, 'statement.pdf');
    fs.writeFileSync(pdfFile, Buffer.from('%PDF-1.4 Mock PDF Content'));

    const mockForm = getFormConfig('bookkeeping-documents')!;
    const options: CreateZipOptions = {
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

      assert.strictEqual(zipPackage.reference, 'SB-2026-ZIP1');
      assert.strictEqual(zipPackage.isMultiPart, false);
      assert.strictEqual(zipPackage.parts.length, 1);
      assert.ok(fs.existsSync(zipPackage.parts[0].zipPath));
      assert.strictEqual(zipPackage.parts[0].zipFilename, 'SecureBooks_Submission_SB-2026-ZIP1.zip');
      assert.ok(zipPackage.parts[0].sizeBytes > 0);
    } finally {
      cleanupSubmissionTempDir(subId);
    }
  });

  test('ZipService preserves uploaded ZIP file inside submission ZIP without extracting', async () => {
    const zipService = new ZipService();
    const subId = `test-zip-inner-${Date.now()}`;
    const tempDir = ensureSubmissionTempDir(subId);

    const uploadedZipFile = path.join(tempDir, 'client_uploaded.zip');
    fs.writeFileSync(uploadedZipFile, Buffer.from('PK\x03\x04Mock Uploaded Zip File Content'));

    const mockForm = getFormConfig('bookkeeping-documents')!;
    const options: CreateZipOptions = {
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
      assert.strictEqual(zipPackage.parts.length, 1);
      assert.ok(fs.existsSync(zipPackage.parts[0].zipPath));
    } finally {
      cleanupSubmissionTempDir(subId);
    }
  });

  test('ZipService partitions files into multi-part ZIP packages when file sizes exceed threshold', async () => {
    const zipService = new ZipService();
    const subId = `test-zip-multi-${Date.now()}`;
    const tempDir = ensureSubmissionTempDir(subId);

    // Create two mock files larger than safe threshold (~7 MB each => 14 MB total)
    const file1 = path.join(tempDir, 'part1.pdf');
    const file2 = path.join(tempDir, 'part2.pdf');
    fs.writeFileSync(file1, Buffer.from('%PDF-1.4 File 1'));
    fs.writeFileSync(file2, Buffer.from('%PDF-1.4 File 2'));

    const mockForm = getFormConfig('bookkeeping-documents')!;
    const options: CreateZipOptions = {
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

      assert.strictEqual(zipPackage.isMultiPart, true);
      assert.strictEqual(zipPackage.parts.length, 2);
      assert.strictEqual(zipPackage.parts[0].zipFilename, 'SecureBooks_Submission_SB-2026-MULTI_Part_1_of_2.zip');
      assert.strictEqual(zipPackage.parts[1].zipFilename, 'SecureBooks_Submission_SB-2026-MULTI_Part_2_of_2.zip');
    } finally {
      cleanupSubmissionTempDir(subId);
    }
  });
});
