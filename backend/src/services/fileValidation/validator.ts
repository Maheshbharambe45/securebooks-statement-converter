import path from 'path';
import { validateMagicBytes, FileValidationResult } from './magicBytes.js';

export const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'xls', 'xlsx', 'csv', 'zip'];

export interface FileMetadata {
  category: string;
  originalName: string;
  sanitizedName: string;
  tempFilePath: string;
  sizeBytes: number;
  mimeType: string;
}

export function sanitizeFilename(filename: string): string {
  // Remove directory traversal characters (.. / \)
  const basename = path.basename(filename);
  // Replace anything that is not alphanumeric, dot, underscore, or hyphen with an underscore
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export interface ValidationConfig {
  maxFileSizeMb: number;
  maxTotalUploadMb: number;
}

export function validateUploadedFiles(
  files: Array<{ category: string; originalName: string; tempPath: string; sizeBytes: number }>,
  config: ValidationConfig
): { isValid: boolean; errors: string[]; validatedFiles: FileMetadata[] } {
  const errors: string[] = [];
  const validatedFiles: FileMetadata[] = [];
  let totalSize = 0;

  const maxFileBytes = config.maxFileSizeMb * 1024 * 1024;
  const maxTotalBytes = config.maxTotalUploadMb * 1024 * 1024;

  for (const file of files) {
    totalSize += file.sizeBytes;
    const extension = file.originalName.split('.').pop()?.toLowerCase() || '';

    // 1. Extension Whitelist
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      errors.push(`File "${file.originalName}" has an unsupported format (.${extension}). Allowed: PDF, JPG, JPEG, PNG, WEBP, XLS, XLSX, CSV, ZIP.`);
      continue;
    }

    // 2. Individual file size check
    if (file.sizeBytes > maxFileBytes) {
      errors.push(`File "${file.originalName}" exceeds the maximum allowed file size of ${config.maxFileSizeMb} MB.`);
      continue;
    }

    // 3. Magic Bytes check
    const magicResult: FileValidationResult = validateMagicBytes(file.tempPath, file.originalName);
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
