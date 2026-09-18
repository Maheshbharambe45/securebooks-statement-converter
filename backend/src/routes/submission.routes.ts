import { Router } from 'express';
import { handleDocumentSubmission, getFormsList, getSingleFormConfig } from '../controllers/submission.controller.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';
import { submissionRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

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
router.get('/forms', getFormsList);
router.get('/forms/:formId', getSingleFormConfig);

// Dynamic Submission Endpoint: /api/forms/:formId/submissions
router.post('/forms/:formId/submissions', submissionRateLimiter, uploadMiddleware.fields(categoryFields), handleDocumentSubmission);

// Backward-compatible Endpoint: /api/submissions
router.post('/submissions', submissionRateLimiter, uploadMiddleware.fields(categoryFields), handleDocumentSubmission);

export default router;
