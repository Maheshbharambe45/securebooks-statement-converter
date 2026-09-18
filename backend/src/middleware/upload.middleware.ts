import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ensureSubmissionTempDir, getSubmissionTempDir } from '../services/cleanup/tempCleanup.js';
import { ALLOWED_EXTENSIONS } from '../services/fileValidation/validator.js';

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Generate or retrieve submission ID attached to request
    let submissionId = req.body.submissionId;
    if (!submissionId) {
      submissionId = uuidv4();
      req.body.submissionId = submissionId;
    }
    const tempDir = ensureSubmissionTempDir(submissionId);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `upload-${uniqueSuffix}${ext}`);
  },
});

export const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file extension .${ext}. Only PDF, JPG, JPEG, PNG, WEBP, XLS, XLSX, CSV are allowed.`));
  }
};

const maxFileSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10);

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024, // Configurable max file size limit
    files: 50, // Maximum total number of files in single submission
  },
});
