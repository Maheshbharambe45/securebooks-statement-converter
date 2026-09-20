import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { SesService, DynamicSubmissionPayload } from '../services/ses/sesService.js';
import { getFormConfig } from '../forms/formRegistry.js';
import { ZipPackageResult } from '../services/zip/zipService.js';

describe('AWS SES Service Unit Tests', () => {
  test('SesService generates raw MIME message buffer with ZIP attachment and headers', () => {
    const sesService = new SesService();
    const tempZipFile = path.join(os.tmpdir(), `ses-test-${Date.now()}.zip`);
    fs.writeFileSync(tempZipFile, Buffer.from('PK\x03\x04Mock ZIP File Content'));

    try {
      const mockForm = getFormConfig('bookkeeping-documents')!;
      const payload: DynamicSubmissionPayload = {
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
      assert.ok(htmlBody.includes('SB-2026-TEST1234'));
      assert.ok(htmlBody.includes('Test Client Ltd'));
      assert.ok(htmlBody.includes('SecureBooks_Submission_SB-2026-TEST1234.zip'));

      const rawMimeBuffer = sesService.buildZipRawMimeMessage(
        'mahesh_bharambe@outlook.com',
        'mahesh_bharambe@outlook.com',
        'Secure Books - Document Submission SB-2026-TEST1234',
        htmlBody,
        tempZipFile,
        'SecureBooks_Submission_SB-2026-TEST1234.zip'
      );

      const mimeString = rawMimeBuffer.toString('utf-8');
      assert.ok(mimeString.includes('From: mahesh_bharambe@outlook.com'));
      assert.ok(mimeString.includes('To: mahesh_bharambe@outlook.com'));
      assert.ok(mimeString.includes('Content-Type: multipart/mixed'));
      assert.ok(mimeString.includes('SecureBooks_Submission_SB-2026-TEST1234.zip'));
      assert.ok(mimeString.includes('Content-Transfer-Encoding: base64'));
    } finally {
      if (fs.existsSync(tempZipFile)) fs.unlinkSync(tempZipFile);
    }
  });

  test('SesService sends ZIP submission email package in mock mode', async () => {
    process.env.MOCK_SES = 'true';
    const sesService = new SesService();
    const tempZipFile = path.join(os.tmpdir(), `ses-mock-${Date.now()}.zip`);
    fs.writeFileSync(tempZipFile, Buffer.from('PK\x03\x04Mock ZIP Content'));

    try {
      const mockForm = getFormConfig('bookkeeping-documents')!;
      const payload: DynamicSubmissionPayload = {
        formConfig: mockForm,
        reference: 'SB-2026-MOCK9999',
        fieldValues: { clientName: 'Mock Client' },
        categoryStatuses: {},
        files: [],
      };

      const zipPackage: ZipPackageResult = {
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

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.mode, 'mock_ses');
      assert.ok(res.messageId?.includes('mock-ses-msg-1-'));
    } finally {
      if (fs.existsSync(tempZipFile)) fs.unlinkSync(tempZipFile);
    }
  });
});
