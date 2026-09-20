"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SesService = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const fs_1 = __importDefault(require("fs"));
const formRegistry_js_1 = require("../../forms/formRegistry.js");
const logger_js_1 = require("../../utils/logger.js");
// AWS SES Hard Raw Email Limit: 10 MiB (10,485,760 bytes)
const SES_MAX_RAW_EMAIL_BYTES = 10485760;
class SesService {
    sesClient = null;
    awsRegion;
    mailFrom;
    mailTo;
    isMockMode;
    constructor() {
        this.awsRegion = (process.env.AWS_REGION || 'ap-south-1').trim();
        this.mailFrom = (process.env.MAIL_FROM || 'mahesh_bharambe@outlook.com').trim();
        this.mailTo = (process.env.MAIL_TO || 'mahesh_bharambe@outlook.com').trim();
        // Enable mock mode explicitly if specified or when running in test environment without AWS credentials
        this.isMockMode = process.env.MOCK_SES === 'true' || process.env.NODE_ENV === 'test';
        if (!this.isMockMode) {
            try {
                this.sesClient = new client_ses_1.SESClient({ region: this.awsRegion });
            }
            catch (err) {
                logger_js_1.Logger.warn(`Failed to initialize AWS SESClient, falling back to mock mode`, { error: err.message });
                this.isMockMode = true;
            }
        }
    }
    generatePartHtmlEmailBody(payload, part) {
        const timestamp = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        const multiPartBanner = part.totalParts > 1
            ? `<div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:6px; padding:12px 16px; margin-bottom:16px;">
           <strong style="color:#1E40AF; font-size:14px;">Package Part ${part.partIndex} of ${part.totalParts}</strong>
           <p style="margin:4px 0 0 0; color:#1E3A8A; font-size:13px;">This submission has been split into ${part.totalParts} ZIP package parts to ensure reliable email delivery.</p>
         </div>`
            : '';
        let fieldsHtml = `<p style="margin:4px 0; color:#475569;"><strong>Form:</strong> ${escapeHtml(payload.formConfig.title)}</p>`;
        for (const field of payload.formConfig.fields) {
            const val = payload.fieldValues[field.id] || 'N/A';
            fieldsHtml += `<p style="margin:4px 0; color:#475569;"><strong>${escapeHtml(field.label)}:</strong> ${escapeHtml(val)}</p>`;
        }
        if (payload.clientEmail) {
            fieldsHtml += `<p style="margin:4px 0; color:#475569;"><strong>Client Email:</strong> ${escapeHtml(payload.clientEmail)}</p>`;
        }
        fieldsHtml += `<p style="margin:4px 0; color:#475569;"><strong>Total Submission Files:</strong> ${payload.files.length}</p>`;
        fieldsHtml += `<p style="margin:4px 0; color:#475569;"><strong>Files in this ZIP Attachment:</strong> ${part.fileCount}</p>`;
        fieldsHtml += `<p style="margin:4px 0; color:#475569;"><strong>Submitted Date:</strong> ${timestamp}</p>`;
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
            ${multiPartBanner}
            <div class="meta-box">
              <h2>Submission Reference: ${payload.reference}</h2>
              ${fieldsHtml}
            </div>

            <p style="color:#334155; font-size:14px; line-height:1.5;">
              All documents for this submission have been packaged into the attached ZIP archive 
              (<code>${escapeHtml(part.zipFilename)}</code>).
            </p>
          </div>
          <div class="footer">
            <p style="margin:0;">This submission was received securely through <a href="https://forms.securebooks.co.uk" style="color:#006B38; text-decoration:none; font-weight:600;">https://forms.securebooks.co.uk</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    buildZipRawMimeMessage(from, to, subject, htmlBody, zipPath, zipFilename) {
        const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        const encodedSubject = /^[\x00-\x7F]*$/.test(subject)
            ? subject
            : `=?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`;
        const headers = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${encodedSubject}`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            '',
            '',
        ].join('\r\n');
        let bodyParts = [
            `--${boundary}`,
            `Content-Type: text/html; charset=utf-8`,
            `Content-Transfer-Encoding: 7bit`,
            '',
            htmlBody,
            '',
        ].join('\r\n');
        if (fs_1.default.existsSync(zipPath)) {
            const zipBuffer = fs_1.default.readFileSync(zipPath);
            const base64Data = zipBuffer.toString('base64').replace(/(.{76})/g, '$1\r\n');
            const sanitizeFilename = zipFilename.replace(/["\r\n]/g, '_');
            const attachmentPart = [
                `--${boundary}`,
                `Content-Type: application/zip; name="${sanitizeFilename}"`,
                `Content-Transfer-Encoding: base64`,
                `Content-Disposition: attachment; filename="${sanitizeFilename}"`,
                '',
                base64Data,
                '',
            ].join('\r\n');
            bodyParts += attachmentPart;
        }
        bodyParts += `--${boundary}--\r\n`;
        return Buffer.from(headers + bodyParts, 'utf-8');
    }
    async sendZipPackagesEmail(payload, zipPackage) {
        const recipient = this.mailTo || (0, formRegistry_js_1.resolveFormRecipient)(payload.formConfig);
        const totalOriginalBytes = payload.files.reduce((sum, f) => sum + f.sizeBytes, 0);
        logger_js_1.Logger.info(`Initiating SES email delivery for ZIP package(s)`, {
            reference: payload.reference,
            totalFiles: payload.files.length,
            totalOriginalSizeMb: (totalOriginalBytes / (1024 * 1024)).toFixed(2),
            isMultiPart: zipPackage.isMultiPart,
            totalParts: zipPackage.parts.length,
        });
        const messageIds = [];
        for (const part of zipPackage.parts) {
            const partSuffix = part.totalParts > 1 ? ` - Part ${part.partIndex} of ${part.totalParts}` : '';
            const subject = `Secure Books - Document Submission ${payload.reference}${partSuffix}`;
            const htmlBody = this.generatePartHtmlEmailBody(payload, part);
            const rawMimeBuffer = this.buildZipRawMimeMessage(this.mailFrom, recipient, subject, htmlBody, part.zipPath, part.zipFilename);
            // Verify MIME raw size before invoking SES
            if (rawMimeBuffer.length > SES_MAX_RAW_EMAIL_BYTES) {
                const errorMsg = `MIME raw email size (${(rawMimeBuffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds AWS SES 10 MB limit for part ${part.partIndex} of ${part.totalParts}.`;
                logger_js_1.Logger.error(`[${payload.reference}] SES size limit check failed`, { error: errorMsg });
                return {
                    success: false,
                    error: errorMsg,
                    mode: this.isMockMode ? 'mock_ses' : 'ses',
                };
            }
            if (this.isMockMode || !this.sesClient) {
                logger_js_1.Logger.info(`[MOCK AWS SES MODE] Simulating SES ZIP email delivery`, {
                    reference: payload.reference,
                    partIndex: part.partIndex,
                    totalParts: part.totalParts,
                    zipFilename: part.zipFilename,
                    zipSizeBytes: part.sizeBytes,
                    mimeSizeBytes: rawMimeBuffer.length,
                    recipient,
                });
                await new Promise((res) => setTimeout(res, 150));
                messageIds.push(`mock-ses-msg-${part.partIndex}-${Date.now()}`);
            }
            else {
                try {
                    const command = new client_ses_1.SendRawEmailCommand({
                        RawMessage: {
                            Data: rawMimeBuffer,
                        },
                    });
                    const response = await this.sesClient.send(command);
                    logger_js_1.Logger.info(`AWS SES ZIP email successfully sent via SendRawEmailCommand`, {
                        reference: payload.reference,
                        partIndex: part.partIndex,
                        totalParts: part.totalParts,
                        messageId: response.MessageId,
                        zipSizeBytes: part.sizeBytes,
                        mimeSizeBytes: rawMimeBuffer.length,
                        recipient,
                    });
                    if (response.MessageId) {
                        messageIds.push(response.MessageId);
                    }
                }
                catch (err) {
                    logger_js_1.Logger.error(`AWS SES ZIP email delivery failed for part ${part.partIndex} of ${part.totalParts}`, {
                        reference: payload.reference,
                        error: err.message,
                    });
                    return {
                        success: false,
                        error: err.message,
                        mode: 'ses',
                    };
                }
            }
        }
        return {
            success: true,
            messageId: messageIds.join(','),
            mode: this.isMockMode ? 'mock_ses' : 'ses',
        };
    }
}
exports.SesService = SesService;
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
