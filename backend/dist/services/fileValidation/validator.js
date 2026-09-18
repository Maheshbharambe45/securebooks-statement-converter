"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_EXTENSIONS = void 0;
exports.sanitizeFilename = sanitizeFilename;
exports.validateUploadedFiles = validateUploadedFiles;
const path_1 = __importDefault(require("path"));
const magicBytes_js_1 = require("./magicBytes.js");
exports.ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'xls', 'xlsx', 'csv'];
function sanitizeFilename(filename) {
    // Remove directory traversal characters (.. / \)
    const basename = path_1.default.basename(filename);
    // Replace anything that is not alphanumeric, dot, underscore, or hyphen with an underscore
    return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
}
function validateUploadedFiles(files, config) {
    const errors = [];
    const validatedFiles = [];
    let totalSize = 0;
    const maxFileBytes = config.maxFileSizeMb * 1024 * 1024;
    const maxTotalBytes = config.maxTotalUploadMb * 1024 * 1024;
    for (const file of files) {
        totalSize += file.sizeBytes;
        const extension = file.originalName.split('.').pop()?.toLowerCase() || '';
        // 1. Extension Whitelist
        if (!exports.ALLOWED_EXTENSIONS.includes(extension)) {
            errors.push(`File "${file.originalName}" has an unsupported format (.${extension}). Allowed: PDF, JPG, JPEG, PNG, WEBP, XLS, XLSX, CSV.`);
            continue;
        }
        // 2. Individual file size check
        if (file.sizeBytes > maxFileBytes) {
            errors.push(`File "${file.originalName}" exceeds the maximum allowed file size of ${config.maxFileSizeMb} MB.`);
            continue;
        }
        // 3. Magic Bytes check
        const magicResult = (0, magicBytes_js_1.validateMagicBytes)(file.tempPath, file.originalName);
        if (!magicResult.isValid) {
            errors.push(`Security rejection for "${file.originalName}": ${magicResult.error}`);
            continue;
        }
        const sanitizedName = sanitizeFilename(file.originalName);
        validatedFiles.push({
            category: file.category,
            originalName: file.originalName,
            sanitizedName,
            tempFilePath: file.tempPath,
            sizeBytes: file.sizeBytes,
            mimeType: magicResult.detectedType || 'application/octet-stream',
        });
    }
    // 4. Total size check
    if (totalSize > maxTotalBytes) {
        errors.push(`Total upload size (${(totalSize / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of ${config.maxTotalUploadMb} MB per submission.`);
    }
    return {
        isValid: errors.length === 0,
        errors,
        validatedFiles,
    };
}
