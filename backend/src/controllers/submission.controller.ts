import { Request, Response, NextFunction } from 'express';
import { generateSubmissionReference } from '../utils/referenceGenerator.js';
import { validateUploadedFiles } from '../services/fileValidation/validator.js';
import { scanFileForMalware } from '../services/malwareScan/securityScanner.js';
import { cleanupSubmissionTempDir } from '../services/cleanup/tempCleanup.js';
import { SesService, DynamicSubmissionPayload } from '../services/ses/sesService.js';
import { getFormConfig, getAllForms } from '../forms/formRegistry.js';
import { Logger } from '../utils/logger.js';

const sesService = new SesService();

export function getFormsList(req: Request, res: Response) {
  const forms = getAllForms();
  return res.status(200).json(
    forms.map((f) => ({
      id: f.id,
      name: f.name || f.title,
      description: f.description,
      status: f.status,
    }))
  );
}

export function getSingleFormConfig(req: Request, res: Response) {
  const formId = req.params.formId;
  const form = getFormConfig(formId);

  if (!form) {
    return res.status(404).json({ success: false, error: `Form '${formId}' not found.` });
  }

  return res.status(200).json({
    id: form.id,
    name: form.name,
    title: form.title,
    description: form.description,
    status: form.status,
    fields: form.fields,
    documentCategories: form.documentCategories,
  });
}

export async function handleDocumentSubmission(req: Request, res: Response, next: NextFunction) {
  const formId = req.params.formId || 'bookkeeping-documents';
  const formConfig = getFormConfig(formId);

  if (!formConfig) {
    return res.status(404).json({ success: false, error: `Form configuration '${formId}' not found.` });
  }

  if (formConfig.status !== 'ACTIVE') {
    return res.status(403).json({ success: false, error: `Form '${formConfig.name}' is currently coming soon and not open for submissions.` });
  }

  const submissionId = req.body.submissionId || 'sub-' + Date.now();
  const reference = generateSubmissionReference();

  Logger.info(`[${reference}] Received submission request for form '${formId}'`, { ip: req.ip });

  try {
    // 1. Validate Form Fields
    const fieldValues: Record<string, string> = {};
    const missingFields: string[] = [];

    for (const field of formConfig.fields) {
      const val = req.body[field.id];
      if (field.required && (!val || !val.trim())) {
        missingFields.push(field.label);
      } else {
        fieldValues[field.id] = val ? val.trim() : '';
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Required fields missing: ${missingFields.join(', ')}`,
      });
    }

    const clientEmail = req.body.clientEmail ? req.body.clientEmail.trim() : undefined;
    const additionalNotes = req.body.additionalNotes ? req.body.additionalNotes.trim() : undefined;

    // 2. Parse Category Statuses and Notes
    let categoryStatuses: Record<string, { status: 'has_documents' | 'na'; notes?: string }> = {};
    if (req.body.categoryStatuses) {
      try {
        categoryStatuses = typeof req.body.categoryStatuses === 'string'
          ? JSON.parse(req.body.categoryStatuses)
          : req.body.categoryStatuses;
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid categoryStatuses JSON payload.' });
      }
    }

    // 3. Process Uploaded Files from Multer
    const multerFiles = (req.files as Express.Multer.File[]) || [];
    const filesToValidate: Array<{ category: string; originalName: string; tempPath: string; sizeBytes: number }> = [];

    for (const file of multerFiles) {
      const categoryKey = file.fieldname.replace(/^files_/, '');
      filesToValidate.push({
        category: categoryKey,
        originalName: file.originalname,
        tempPath: file.path,
        sizeBytes: file.size,
      });
    }

    // 4. Server-Side File Validation (Magic Bytes, Extensions, Size Limits)
    const maxFileSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10);
    const maxTotalUploadMb = parseInt(process.env.MAX_TOTAL_UPLOAD_MB || '25', 10);

    const validationResult = validateUploadedFiles(filesToValidate, {
      maxFileSizeMb,
      maxTotalUploadMb,
    });

    if (!validationResult.isValid) {
      Logger.warn(`[${reference}] Document validation failed`, { errors: validationResult.errors });
      return res.status(400).json({
        success: false,
        error: 'File validation failed. Please check supported file formats (PDF, JPG, PNG, WEBP, XLS, XLSX, CSV, ZIP) and size limits.',
        details: validationResult.errors,
      });
    }

    // 5. Malware / Security Scan
    for (const validatedFile of validationResult.validatedFiles) {
      const scanRes = await scanFileForMalware(validatedFile.tempFilePath, validatedFile.originalName);
      if (!scanRes.isClean) {
        Logger.warn(`[${reference}] Malware security scan rejected file`, { filename: validatedFile.originalName, reason: scanRes.reason });
        return res.status(400).json({
          success: false,
          error: `Security Scan Rejection for "${validatedFile.originalName}": ${scanRes.reason || 'Failed security check.'}`,
        });
      }
    }

    // 6. Build Submission Payload & Send via AWS SES API Service
    const payload: DynamicSubmissionPayload = {
      formConfig,
      reference,
      fieldValues,
      clientEmail,
      categoryStatuses,
      additionalNotes,
      files: validationResult.validatedFiles,
    };

    const sesResult = await sesService.sendSubmissionEmail(payload);

    if (!sesResult.success) {
      Logger.error(`[${reference}] AWS SES submission email delivery failed`, { error: sesResult.error });
      return res.status(502).json({
        success: false,
        error: "We couldn't complete your submission right now. Please try again.",
      });
    }

    Logger.info(`[${reference}] Submission successfully processed & delivered via AWS SES`, {
      formId,
      reference,
      filesCount: validationResult.validatedFiles.length,
      mode: sesResult.mode,
    });

    return res.status(200).json({
      success: true,
      message: 'Your submission has been received successfully.',
      reference,
      submittedAt: new Date().toISOString(),
      filesCount: validationResult.validatedFiles.length,
    });
  } catch (err: any) {
    Logger.error(`[${reference}] Unexpected server error during submission processing`, { error: err.message });
    return res.status(500).json({
      success: false,
      error: "We couldn't submit your documents right now. Please try again.",
    });
  } finally {
    // 7. Clean temporary files
    cleanupSubmissionTempDir(submissionId);
  }
}
