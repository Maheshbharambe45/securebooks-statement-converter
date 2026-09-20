import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { normalizeMulterFiles, handleDocumentSubmission } from '../controllers/submission.controller.js';
import { ensureSubmissionTempDir, cleanupSubmissionTempDir } from '../services/cleanup/tempCleanup.js';

describe('Submission Controller Multer Normalization & Submission Tests', () => {
  test('normalizeMulterFiles handles undefined and null safely', () => {
    assert.deepStrictEqual(normalizeMulterFiles(undefined), []);
    assert.deepStrictEqual(normalizeMulterFiles(null), []);
  });

  test('normalizeMulterFiles handles empty object dictionary', () => {
    assert.deepStrictEqual(normalizeMulterFiles({}), []);
  });

  test('normalizeMulterFiles normalizes Multer upload.fields() object dictionary into flat array', () => {
    const mockFile1 = { fieldname: 'files_bank_statements', originalname: 'bank.pdf' } as Express.Multer.File;
    const mockFile2 = { fieldname: 'files_bank_statements', originalname: 'bank2.pdf' } as Express.Multer.File;
    const mockFile3 = { fieldname: 'files_payroll', originalname: 'payroll.pdf' } as Express.Multer.File;

    const fieldsDict = {
      files_bank_statements: [mockFile1, mockFile2],
      files_payroll: [mockFile3],
    };

    const normalized = normalizeMulterFiles(fieldsDict);
    assert.strictEqual(normalized.length, 3);
    assert.strictEqual(normalized[0].originalname, 'bank.pdf');
    assert.strictEqual(normalized[1].originalname, 'bank2.pdf');
    assert.strictEqual(normalized[2].originalname, 'payroll.pdf');
  });

  test('normalizeMulterFiles normalizes Multer upload.any() array into flat array', () => {
    const mockFile1 = { fieldname: 'files_bank_statements', originalname: 'bank.pdf' } as Express.Multer.File;
    const mockFile2 = { fieldname: 'files_payroll', originalname: 'payroll.pdf' } as Express.Multer.File;

    const filesArray = [mockFile1, mockFile2];
    const normalized = normalizeMulterFiles(filesArray);

    assert.strictEqual(normalized.length, 2);
    assert.strictEqual(normalized[0].originalname, 'bank.pdf');
    assert.strictEqual(normalized[1].originalname, 'payroll.pdf');
  });

  test('handleDocumentSubmission processes submission with Multer fields object dictionary, N/A categories, and cleans temp directory', async () => {
    process.env.MOCK_SES = 'true';
    const subId = `test-sub-multer-${Date.now()}`;
    const tempDir = ensureSubmissionTempDir(subId);

    const pdfPath1 = path.join(tempDir, 'temp1.pdf');
    const pdfPath2 = path.join(tempDir, 'temp2.pdf');
    fs.writeFileSync(pdfPath1, Buffer.from('%PDF-1.4 Mock PDF 1'));
    fs.writeFileSync(pdfPath2, Buffer.from('%PDF-1.4 Mock PDF 2'));

    const mockReq: any = {
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
    let jsonResult: any = null;

    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return mockRes;
      },
      json: (data: any) => {
        jsonResult = data;
        return mockRes;
      },
    };

    try {
      await handleDocumentSubmission(mockReq, mockRes, () => {});

      assert.strictEqual(statusCode, 200);
      assert.strictEqual(jsonResult.success, true);
      assert.strictEqual(jsonResult.filesCount, 2);
      assert.ok(jsonResult.reference.startsWith('SB-2026-'));

      // Verify temporary directory cleanup after SES handoff
      assert.strictEqual(fs.existsSync(tempDir), false);
    } finally {
      cleanupSubmissionTempDir(subId);
    }
  });

  test('handleDocumentSubmission rejects submission above 70 MB total upload limit and cleans temp directory', async () => {
    process.env.MOCK_SES = 'true';
    const subId = `test-sub-oversize-${Date.now()}`;
    const tempDir = ensureSubmissionTempDir(subId);

    const pdfPath = path.join(tempDir, 'large_temp.pdf');
    fs.writeFileSync(pdfPath, Buffer.from('%PDF-1.4 Mock Large PDF'));

    const mockReq: any = {
      params: { formId: 'bookkeeping-documents' },
      body: {
        submissionId: subId,
        clientName: 'Over 70MB Ltd',
        startDate: '01/04/2026',
        endDate: '30/04/2026',
        selectionType: 'Month',
        selectedPeriod: 'April 2026',
        categoryStatuses: JSON.stringify({
          bank_statements: { status: 'has_documents' },
        }),
      },
      files: {
        files_bank_statements: [
          {
            fieldname: 'files_bank_statements',
            originalname: 'large_statement.pdf',
            path: pdfPath,
            size: 75 * 1024 * 1024, // 75 MB (exceeds 70 MB total upload limit)
          },
        ],
      },
      ip: '127.0.0.1',
    };

    let statusCode = 0;
    let jsonResult: any = null;

    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return mockRes;
      },
      json: (data: any) => {
        jsonResult = data;
        return mockRes;
      },
    };

    try {
      await handleDocumentSubmission(mockReq, mockRes, () => {});

      assert.strictEqual(statusCode, 400);
      assert.strictEqual(jsonResult.success, false);
      assert.match(jsonResult.error, /exceed the maximum submission size of 70 MB/i);

      // Verify temporary directory cleanup after rejection
      assert.strictEqual(fs.existsSync(tempDir), false);
    } finally {
      cleanupSubmissionTempDir(subId);
    }
  });

  test('handleDocumentSubmission processes submission with no uploaded files when all categories are N/A', async () => {
    process.env.MOCK_SES = 'true';
    const subId = `test-sub-nofiles-${Date.now()}`;

    const mockReq: any = {
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
    let jsonResult: any = null;

    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return mockRes;
      },
      json: (data: any) => {
        jsonResult = data;
        return mockRes;
      },
    };

    await handleDocumentSubmission(mockReq, mockRes, () => {});

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(jsonResult.success, true);
    assert.strictEqual(jsonResult.filesCount, 0);
  });
});
