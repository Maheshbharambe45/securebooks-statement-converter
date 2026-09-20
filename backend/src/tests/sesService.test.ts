import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { SesService, DynamicSubmissionPayload } from '../services/ses/sesService.js';
import { getFormConfig } from '../forms/formRegistry.js';

describe('AWS SES Service Unit Tests', () => {
  test('SesService generates raw MIME message buffer with attachments and headers', () => {
    const sesService = new SesService();
    const tempFile = path.join(os.tmpdir(), `ses-test-${Date.now()}.pdf`);
    fs.writeFileSync(tempFile, Buffer.from('%PDF-1.4 Mock PDF Document'));

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
      assert.ok(htmlBody.includes('SB-2026-TEST1234'));
      assert.ok(htmlBody.includes('Test Client Ltd'));
      assert.ok(htmlBody.includes('Status: AVAILABLE'));
      assert.ok(htmlBody.includes('bank_statement_april.pdf'));
      assert.ok(htmlBody.includes('Status: N/A'));

      const rawMimeBuffer = sesService.buildRawMimeMessage(
        'mahesh_bharambe@outlook.com',
        'mahesh_bharambe@outlook.com',
        'Bookkeeping Documents Submission - Test Client Ltd - April 2026',
        htmlBody,
        payload.files
      );

      const mimeString = rawMimeBuffer.toString('utf-8');
      assert.ok(mimeString.includes('From: mahesh_bharambe@outlook.com'));
      assert.ok(mimeString.includes('To: mahesh_bharambe@outlook.com'));
      assert.ok(mimeString.includes('Content-Type: multipart/mixed'));
      assert.ok(mimeString.includes('bank_statement_april.pdf'));
      assert.ok(mimeString.includes('Content-Transfer-Encoding: base64'));
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  });

  test('SesService sends submission email in mock mode', async () => {
    process.env.MOCK_SES = 'true';
    const sesService = new SesService();
    const mockForm = getFormConfig('bookkeeping-documents')!;
    
    const res = await sesService.sendSubmissionEmail({
      formConfig: mockForm,
      reference: 'SB-2026-MOCK9999',
      fieldValues: { clientName: 'Mock Client' },
      categoryStatuses: {},
      files: [],
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.mode, 'mock_ses');
    assert.ok(res.messageId?.startsWith('mock-ses-msg-'));
  });
});
