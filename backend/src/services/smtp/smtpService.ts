import nodemailer from 'nodemailer';
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

export type SubmissionPayload = DynamicSubmissionPayload & {
  clientName: string;
  bookkeepingPeriod: string;
  monthQuarter: string;
};

export interface SmtpSendResult {
  success: boolean;
  messageId?: string;
  mode: 'smtp' | 'mock_smtp';
  error?: string;
}

export class SmtpService {
  private smtpHost: string;
  private smtpPort: number;
  private smtpSecure: boolean;
  private smtpUser: string;
  private smtpPass: string;
  private mailFrom: string;
  private mailTo: string;
  private isMockMode: boolean;

  constructor() {
    this.smtpHost = (process.env.SMTP_HOST || '').trim();
    this.smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    this.smtpSecure = process.env.SMTP_SECURE === 'true';
    this.smtpUser = (process.env.SMTP_USER || '').trim();
    this.smtpPass = (process.env.SMTP_PASSWORD || '').trim();
    this.mailFrom = (process.env.MAIL_FROM || 'info@securebooks.co.uk').trim();
    this.mailTo = (process.env.MAIL_TO || 'info@securebooks.co.uk').trim();
    this.isMockMode = !this.smtpHost;
  }

  public generateHtmlEmailBody(payload: DynamicSubmissionPayload): string {
    const timestamp = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

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

    let categoryRowsHtml = '';
    for (const category of payload.formConfig.documentCategories) {
      const catState = payload.categoryStatuses[category.id] || { status: 'na' };
      const catFiles = payload.files.filter((f) => f.category === category.id);

      let statusBadge = '';
      if (catState.status === 'na') {
        statusBadge = `<span style="display:inline-block; padding:3px 8px; border-radius:4px; background:#F1F5F9; color:#64748B; font-weight:600; font-size:13px;">Not Applicable (N/A) — Documents not available</span>`;
      } else {
        statusBadge = `<span style="display:inline-block; padding:3px 8px; border-radius:4px; background:#DCFCE7; color:#15803D; font-weight:600; font-size:13px;">✓ I have documents (${catFiles.length} file${catFiles.length === 1 ? '' : 's'})</span>`;
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
            <p style="margin:0;">This submission was received securely through <a href="https://forms.securebooks.co.uk" style="color:#006B38; text-decoration:none; font-weight:600;">https://forms.securebooks.co.uk</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  public async sendSubmissionEmail(payload: DynamicSubmissionPayload): Promise<SmtpSendResult> {
    const recipient = this.mailTo || resolveFormRecipient(payload.formConfig);
    const subjectData = {
      reference: payload.reference,
      ...payload.fieldValues,
    };
    const subject = renderSubjectTemplate(payload.formConfig, subjectData);
    const htmlBody = this.generateHtmlEmailBody(payload);

    if (this.isMockMode) {
      Logger.info(`[MOCK SMTP MODE] Simulating SMTP email delivery`, {
        formId: payload.formConfig.id,
        reference: payload.reference,
        recipient,
        from: this.mailFrom,
        subject,
        fileCount: payload.files.length,
        totalSizeMb: (payload.files.reduce((sum, f) => sum + f.sizeBytes, 0) / (1024 * 1024)).toFixed(2),
      });

      await new Promise((res) => setTimeout(res, 300));

      return {
        success: true,
        messageId: `mock-smtp-msg-${Date.now()}`,
        mode: 'mock_smtp',
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: this.smtpSecure,
        auth:
          this.smtpUser && this.smtpPass
            ? {
                user: this.smtpUser,
                pass: this.smtpPass,
              }
            : undefined,
      });

      const attachments = payload.files.map((f) => ({
        filename: f.originalName,
        path: f.tempFilePath,
        contentType: f.mimeType,
      }));

      const mailOptions: nodemailer.SendMailOptions = {
        from: this.mailFrom,
        to: recipient,
        replyTo: payload.clientEmail || undefined,
        subject,
        html: htmlBody,
        attachments,
      };

      const info = await transporter.sendMail(mailOptions);
      Logger.info(`SMTP email successfully sent`, { reference: payload.reference, messageId: info.messageId, recipient });

      return {
        success: true,
        messageId: info.messageId,
        mode: 'smtp',
      };
    } catch (err: any) {
      Logger.error(`SMTP email delivery failed`, { reference: payload.reference, error: err.message });
      return {
        success: false,
        error: err.message,
        mode: 'smtp',
      };
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
