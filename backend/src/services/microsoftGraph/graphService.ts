import fs from 'fs';
import { FileMetadata } from '../fileValidation/validator.js';
import { FormConfig } from '../../forms/types.js';
import { resolveFormRecipient, renderSubjectTemplate } from '../../forms/formRegistry.js';
import { Logger } from '../../utils/logger.js';

export interface DynamicSubmissionPayload {
  formConfig: FormConfig;
  reference: string;
  fieldValues: Record<string, string>;
  clientEmail?: string;
  categoryStatuses: Record<string, { status: 'has_documents' | 'na'; notes?: string }>;
  additionalNotes?: string;
  files: FileMetadata[];
}

// Backward compatible interface alias
export type SubmissionPayload = DynamicSubmissionPayload & {
  clientName: string;
  bookkeepingPeriod: string;
  monthQuarter: string;
};

export interface GraphSendResult {
  success: boolean;
  messageId?: string;
  mode: 'azure_graph' | 'mock_graph';
  error?: string;
}

export class MicrosoftGraphService {
  private tenantId: string;
  private clientId: string;
  private clientSecret: string;
  private senderMailbox: string;
  private isMockMode: boolean;

  constructor() {
    this.tenantId = process.env.MICROSOFT_TENANT_ID || '';
    this.clientId = process.env.MICROSOFT_CLIENT_ID || '';
    this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET || '';
    this.senderMailbox = process.env.OUTLOOK_SENDER || 'info@securebooks.co.uk';
    this.isMockMode = process.env.USE_MOCK_GRAPH === 'true' || !this.clientId || !this.clientSecret || !this.tenantId;
  }

  private async getAccessToken(): Promise<string> {
    if (this.isMockMode) return 'mock-access-token';

    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: 'https://graph.microsoft.com/.default',
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Entra ID OAuth Token request failed [${response.status}]: ${errorText}`);
    }

    const data: any = await response.json();
    return data.access_token;
  }

  public generateHtmlEmailBody(payload: DynamicSubmissionPayload): string {
    const timestamp = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Render Fields HTML
    let fieldsHtml = `<p style="margin:4px 0; color:#475569;"><strong>Form:</strong> ${escapeHtml(payload.formConfig.title)}</p>`;
    for (const field of payload.formConfig.fields) {
      const val = payload.fieldValues[field.id] || 'N/A';
      fieldsHtml += `<p style="margin:4px 0; color:#475569;"><strong>${escapeHtml(field.label)}:</strong> ${escapeHtml(val)}</p>`;
    }

    if (payload.clientEmail) {
      fieldsHtml += `<p style="margin:4px 0; color:#475569;"><strong>Client Email:</strong> ${escapeHtml(payload.clientEmail)}</p>`;
    }

    fieldsHtml += `<p style="margin:4px 0; color:#475569;"><strong>Total Attached Files:</strong> ${payload.files.length}</p>`;
    fieldsHtml += `<p style="margin:4px 0; color:#475569;"><strong>Submitted Date:</strong> ${timestamp}</p>`;

    // Render Document Categories HTML
    let categoryRowsHtml = '';
    for (const category of payload.formConfig.documentCategories) {
      const catState = payload.categoryStatuses[category.id] || { status: 'na' };
      const catFiles = payload.files.filter((f) => f.category === category.id);

      let statusBadge = '';
      if (catState.status === 'na') {
        statusBadge = `<span style="display:inline-block; padding:3px 8px; border-radius:4px; background:#F1F5F9; color:#64748B; font-weight:600; font-size:13px;">N/A — Not Applicable</span>`;
      } else {
        statusBadge = `<span style="display:inline-block; padding:3px 8px; border-radius:4px; background:#DCFCE7; color:#15803D; font-weight:600; font-size:13px;">✓ ${catFiles.length} File${catFiles.length === 1 ? '' : 's'} Uploaded</span>`;
      }

      let notesHtml = '';
      if (catState.notes && catState.notes.trim()) {
        notesHtml = `<div style="margin-top:4px; font-size:12px; color:#475569; font-style:italic;"><strong>Notes:</strong> ${escapeHtml(catState.notes.trim())}</div>`;
      }

      categoryRowsHtml += `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 12px 16px; font-weight: 600; color: #0F172A; vertical-align: top;">${escapeHtml(category.name)}</td>
          <td style="padding: 12px 16px; vertical-align: top;">
            ${statusBadge}
            ${notesHtml}
          </td>
        </tr>
      `;
    }

    const additionalNotesHtml = payload.additionalNotes && payload.additionalNotes.trim()
      ? `<div style="margin-top:20px; padding:16px; background:#F8FAFC; border-left:4px solid #006B38; border-radius:4px;">
           <strong style="color:#0B1F46;">Additional Notes for Secure Books:</strong>
           <p style="margin:8px 0 0 0; color:#334155; font-size:14px; white-space:pre-wrap;">${escapeHtml(payload.additionalNotes.trim())}</p>
         </div>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #F8FAFC; color: #1E293B; margin: 0; padding: 20px; }
          .container { max-width: 680px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #0B1F46; padding: 24px; text-align: center; border-bottom: 4px solid #006B38; }
          .header h1 { color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
          .header p { color: #94A3B8; margin: 6px 0 0 0; font-size: 13px; }
          .content { padding: 24px; }
          .meta-box { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
          .meta-box h2 { color: #166534; margin: 0 0 12px 0; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .footer { background: #F1F5F9; padding: 16px 24px; font-size: 12px; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SECURE BOOKS</h1>
            <p>${escapeHtml(payload.formConfig.title)}</p>
          </div>
          <div class="content">
            <div class="meta-box">
              <h2>Submission Reference: ${payload.reference}</h2>
              ${fieldsHtml}
            </div>

            <h3 style="color:#0B1F46; border-bottom:2px solid #006B38; padding-bottom:8px; margin-top:24px;">Document Category Summary</h3>
            <table>
              <thead>
                <tr style="background:#F8FAFC; text-align:left; border-bottom:2px solid #CBD5E1;">
                  <th style="padding:10px 16px; color:#475569; font-size:13px;">Category</th>
                  <th style="padding:10px 16px; color:#475569; font-size:13px;">Status & Notes</th>
                </tr>
              </thead>
              <tbody>
                ${categoryRowsHtml}
              </tbody>
            </table>

            ${additionalNotesHtml}
          </div>
          <div class="footer">
            <p style="margin:0;">This submission was received securely through <a href="https://www.securebooks.co.uk" style="color:#006B38; text-decoration:none; font-weight:600;">https://www.securebooks.co.uk</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public async sendSubmissionEmail(payload: DynamicSubmissionPayload): Promise<GraphSendResult> {
    const recipient = resolveFormRecipient(payload.formConfig);
    const subjectData = {
      reference: payload.reference,
      ...payload.fieldValues,
    };
    const subject = renderSubjectTemplate(payload.formConfig, subjectData);
    const htmlBody = this.generateHtmlEmailBody(payload);

    if (this.isMockMode) {
      Logger.info(`[MOCK GRAPH MODE] Simulating Microsoft Graph API email delivery`, {
        formId: payload.formConfig.id,
        reference: payload.reference,
        recipient,
        subject,
        fileCount: payload.files.length,
        totalSizeMb: (payload.files.reduce((sum, f) => sum + f.sizeBytes, 0) / (1024 * 1024)).toFixed(2),
      });

      // Simulate network latency
      await new Promise((res) => setTimeout(res, 600));

      return {
        success: true,
        messageId: `mock-msg-${Date.now()}`,
        mode: 'mock_graph',
      };
    }

    try {
      const accessToken = await this.getAccessToken();

      // 1. Create Draft Message
      const createMessageUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(this.senderMailbox)}/messages`;
      const draftPayload = {
        subject,
        body: { contentType: 'HTML', content: htmlBody },
        toRecipients: [{ emailAddress: { address: recipient } }],
      };

      const createRes = await fetch(createMessageUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftPayload),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Failed to create draft message in Microsoft Graph [${createRes.status}]: ${errText}`);
      }

      const draftMessage: any = await createRes.json();
      const messageId = draftMessage.id;

      // 2. Add Attachments
      for (const file of payload.files) {
        const fileSizeBytes = file.sizeBytes;
        const THREE_MB = 3 * 1024 * 1024;

        if (fileSizeBytes < THREE_MB) {
          const fileBuffer = fs.readFileSync(file.tempFilePath);
          const attachUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(this.senderMailbox)}/messages/${messageId}/attachments`;
          const attachBody = {
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: file.originalName,
            contentType: file.mimeType,
            contentBytes: fileBuffer.toString('base64'),
          };

          const attachRes = await fetch(attachUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(attachBody),
          });

          if (!attachRes.ok) {
            const errText = await attachRes.text();
            throw new Error(`Failed to attach file "${file.originalName}" (<3MB) [${attachRes.status}]: ${errText}`);
          }
        } else {
          await this.uploadLargeAttachmentSession(accessToken, messageId, file);
        }
      }

      // 3. Send Message
      const sendUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(this.senderMailbox)}/messages/${messageId}/send`;
      const sendRes = await fetch(sendUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!sendRes.ok && sendRes.status !== 202) {
        const errText = await sendRes.text();
        throw new Error(`Failed to send message via Microsoft Graph [${sendRes.status}]: ${errText}`);
      }

      Logger.info(`Microsoft Graph API email successfully sent`, { reference: payload.reference, messageId, recipient });
      return {
        success: true,
        messageId,
        mode: 'azure_graph',
      };
    } catch (err: any) {
      Logger.error(`Microsoft Graph API submission failed`, { reference: payload.reference, error: err.message });
      return {
        success: false,
        error: err.message,
        mode: 'azure_graph',
      };
    }
  }

  private async uploadLargeAttachmentSession(accessToken: string, messageId: string, file: FileMetadata): Promise<void> {
    const createSessionUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(this.senderMailbox)}/messages/${messageId}/attachments/createUploadSession`;
    const sessionBody = {
      AttachmentItem: {
        attachmentType: 'file',
        name: file.originalName,
        size: file.sizeBytes,
        contentType: file.mimeType,
      },
    };

    const sessionRes = await fetch(createSessionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionBody),
    });

    if (!sessionRes.ok) {
      const errText = await sessionRes.text();
      throw new Error(`Failed to create large attachment upload session for "${file.originalName}" [${sessionRes.status}]: ${errText}`);
    }

    const sessionData: any = await sessionRes.json();
    const uploadUrl = sessionData.uploadUrl;

    const chunkSize = 320 * 1024 * 10;
    const fileFd = fs.openSync(file.tempFilePath, 'r');
    const totalSize = file.sizeBytes;
    let start = 0;

    try {
      while (start < totalSize) {
        const end = Math.min(start + chunkSize, totalSize);
        const currentChunkLength = end - start;
        const chunkBuffer = Buffer.alloc(currentChunkLength);

        fs.readSync(fileFd, chunkBuffer, 0, currentChunkLength, start);

        const chunkRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Length': currentChunkLength.toString(),
            'Content-Range': `bytes ${start}-${end - 1}/${totalSize}`,
          },
          body: chunkBuffer,
        });

        if (!chunkRes.ok && chunkRes.status !== 201 && chunkRes.status !== 200) {
          const errText = await chunkRes.text();
          throw new Error(`Chunk upload failed for "${file.originalName}" at bytes ${start}-${end} [${chunkRes.status}]: ${errText}`);
        }

        start = end;
      }
    } finally {
      fs.closeSync(fileFd);
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
