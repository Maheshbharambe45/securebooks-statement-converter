"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submission_controller_js_1 = require("../controllers/submission.controller.js");
const upload_middleware_js_1 = require("../middleware/upload.middleware.js");
const rateLimiter_js_1 = require("../middleware/rateLimiter.js");
const router = (0, express_1.Router)();
// Accept dynamic category upload fields across all forms
const categoryFields = [
    // Bookkeeping categories
    { name: 'files_bank_statements', maxCount: 20 },
    { name: 'files_credit_cards', maxCount: 20 },
    { name: 'files_sales_invoices', maxCount: 20 },
    { name: 'files_purchase_bills', maxCount: 20 },
    { name: 'files_expense_bills', maxCount: 20 },
    { name: 'files_expense_claims', maxCount: 20 },
    { name: 'files_petty_cash', maxCount: 20 },
    { name: 'files_payroll', maxCount: 20 },
    { name: 'files_pension_reports', maxCount: 20 },
    { name: 'files_vat_records', maxCount: 20 },
    { name: 'files_loans_hp', maxCount: 20 },
    { name: 'files_additional_docs', maxCount: 20 },
    // VAT & Future form categories
    { name: 'files_vat_summary', maxCount: 20 },
    { name: 'files_c79_certificates', maxCount: 20 },
    { name: 'files_additional_vat_docs', maxCount: 20 },
];
// Form Registry Endpoints
router.get('/forms', submission_controller_js_1.getFormsList);
router.get('/forms/:formId', submission_controller_js_1.getSingleFormConfig);
// Dynamic Submission Endpoint: /api/forms/:formId/submissions
router.post('/forms/:formId/submissions', rateLimiter_js_1.submissionRateLimiter, upload_middleware_js_1.uploadMiddleware.fields(categoryFields), submission_controller_js_1.handleDocumentSubmission);
// Backward-compatible Endpoint: /api/submissions
router.post('/submissions', rateLimiter_js_1.submissionRateLimiter, upload_middleware_js_1.uploadMiddleware.fields(categoryFields), submission_controller_js_1.handleDocumentSubmission);
exports.default = router;
