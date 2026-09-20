"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormsList = getFormsList;
exports.getSingleFormConfig = getSingleFormConfig;
exports.handleDocumentSubmission = handleDocumentSubmission;
const referenceGenerator_js_1 = require("../utils/referenceGenerator.js");
const validator_js_1 = require("../services/fileValidation/validator.js");
const securityScanner_js_1 = require("../services/malwareScan/securityScanner.js");
const tempCleanup_js_1 = require("../services/cleanup/tempCleanup.js");
const smtpService_js_1 = require("../services/smtp/smtpService.js");
const formRegistry_js_1 = require("../forms/formRegistry.js");
const logger_js_1 = require("../utils/logger.js");
const smtpService = new smtpService_js_1.SmtpService();
function getFormsList(req, res) {
    const forms = (0, formRegistry_js_1.getAllForms)();
    return res.status(200).json(forms.map((f) => ({
        id: f.id,
        name: f.name || f.title,
        description: f.description,
        status: f.status,
    })));
}
function getSingleFormConfig(req, res) {
    const formId = req.params.formId;
    const form = (0, formRegistry_js_1.getFormConfig)(formId);
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
async function handleDocumentSubmission(req, res, next) {
    const formId = req.params.formId || 'bookkeeping-documents';
    const formConfig = (0, formRegistry_js_1.getFormConfig)(formId);
    if (!formConfig) {
        return res.status(404).json({ success: false, error: `Form configuration '${formId}' not found.` });
    }
    if (formConfig.status !== 'ACTIVE') {
        return res.status(403).json({ success: false, error: `Form '${formConfig.name}' is currently coming soon and not open for submissions.` });
    }
    const submissionId = req.body.submissionId || 'sub-' + Date.now();
    const reference = (0, referenceGenerator_js_1.generateSubmissionReference)();
    logger_js_1.Logger.info(`[${reference}] Received submission request for form '${formId}'`, { ip: req.ip });
    try {
        // 1. Validate Form Fields
        const fieldValues = {};
        const missingFields = [];
        for (const field of formConfig.fields) {
            const val = req.body[field.id];
            if (field.required && (!val || !val.trim())) {
                missingFields.push(field.label);
            }
            else {
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
        let categoryStatuses = {};
        if (req.body.categoryStatuses) {
            try {
                categoryStatuses = typeof req.body.categoryStatuses === 'string'
                    ? JSON.parse(req.body.categoryStatuses)
                    : req.body.categoryStatuses;
            }
            catch (e) {
                return res.status(400).json({ success: false, error: 'Invalid categoryStatuses JSON payload.' });
            }
        }
        // 3. Process Uploaded Files from Multer
        const multerFiles = req.files || [];
        const filesToValidate = [];
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
        const maxTotalUploadMb = parseInt(process.env.MAX_TOTAL_UPLOAD_MB || '100', 10);
        const validationResult = (0, validator_js_1.validateUploadedFiles)(filesToValidate, {
            maxFileSizeMb,
            maxTotalUploadMb,
        });
        if (!validationResult.isValid) {
            logger_js_1.Logger.warn(`[${reference}] Document validation failed`, { errors: validationResult.errors });
            return res.status(400).json({
                success: false,
                error: 'File validation failed. Please check supported file formats (PDF, JPG, PNG, WEBP, XLS, XLSX, CSV, ZIP) and size limits.',
                details: validationResult.errors,
            });
        }
        // 5. Malware / Security Scan
        for (const validatedFile of validationResult.validatedFiles) {
            const scanRes = await (0, securityScanner_js_1.scanFileForMalware)(validatedFile.tempFilePath, validatedFile.originalName);
            if (!scanRes.isClean) {
                logger_js_1.Logger.warn(`[${reference}] Malware security scan rejected file`, { filename: validatedFile.originalName, reason: scanRes.reason });
                return res.status(400).json({
                    success: false,
                    error: `Security Scan Rejection for "${validatedFile.originalName}": ${scanRes.reason || 'Failed security check.'}`,
                });
            }
        }
        // 6. Build Submission Payload & Send via SMTP Service
        const payload = {
            formConfig,
            reference,
            fieldValues,
            clientEmail,
            categoryStatuses,
            additionalNotes,
            files: validationResult.validatedFiles,
        };
        const smtpResult = await smtpService.sendSubmissionEmail(payload);
        if (!smtpResult.success) {
            logger_js_1.Logger.error(`[${reference}] SMTP submission email delivery failed`, { error: smtpResult.error });
            return res.status(502).json({
                success: false,
                error: "We couldn't submit your documents right now. Please try again or contact info@securebooks.co.uk",
                details: smtpResult.error,
            });
        }
        logger_js_1.Logger.info(`[${reference}] Submission successfully processed & delivered via SMTP`, {
            formId,
            reference,
            filesCount: validationResult.validatedFiles.length,
            mode: smtpResult.mode,
        });
        return res.status(200).json({
            success: true,
            message: 'Your submission has been received successfully.',
            reference,
            submittedAt: new Date().toISOString(),
            filesCount: validationResult.validatedFiles.length,
        });
    }
    catch (err) {
        logger_js_1.Logger.error(`[${reference}] Unexpected server error during submission processing`, { error: err.message });
        return res.status(500).json({
            success: false,
            error: "We couldn't submit your documents right now. Please try again.",
        });
    }
    finally {
        // 7. Clean temporary files
        (0, tempCleanup_js_1.cleanupSubmissionTempDir)(submissionId);
    }
}
