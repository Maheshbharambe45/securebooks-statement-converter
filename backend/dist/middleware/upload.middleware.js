"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = exports.fileFilter = exports.storage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const tempCleanup_js_1 = require("../services/cleanup/tempCleanup.js");
const validator_js_1 = require("../services/fileValidation/validator.js");
exports.storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Generate or retrieve submission ID attached to request
        let submissionId = req.body.submissionId;
        if (!submissionId) {
            submissionId = (0, uuid_1.v4)();
            req.body.submissionId = submissionId;
        }
        const tempDir = (0, tempCleanup_js_1.ensureSubmissionTempDir)(submissionId);
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `upload-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
    if (validator_js_1.ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Invalid file extension .${ext}. Only PDF, JPG, JPEG, PNG, WEBP, XLS, XLSX, CSV are allowed.`));
    }
};
exports.fileFilter = fileFilter;
const maxFileSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10);
exports.uploadMiddleware = (0, multer_1.default)({
    storage: exports.storage,
    fileFilter: exports.fileFilter,
    limits: {
        fileSize: maxFileSizeMb * 1024 * 1024, // Configurable max file size limit
        files: 50, // Maximum total number of files in single submission
    },
});
