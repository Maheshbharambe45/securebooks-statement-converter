"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMagicBytes = validateMagicBytes;
const fs_1 = __importDefault(require("fs"));
function validateMagicBytes(filePath, originalFilename) {
    const extension = originalFilename.split('.').pop()?.toLowerCase() || '';
    let buffer;
    try {
        const fd = fs_1.default.openSync(filePath, 'r');
        buffer = Buffer.alloc(512); // read first 512 bytes for magic numbers & script checks
        fs_1.default.readSync(fd, buffer, 0, 512, 0);
        fs_1.default.closeSync(fd);
    }
    catch (err) {
        return { isValid: false, error: 'Could not read file header for verification' };
    }
    // 1. Check for dangerous executable / script magic bytes regardless of extension
    if (buffer.length >= 2 && buffer[0] === 0x4d && buffer[1] === 0x5a) {
        return { isValid: false, error: 'Executable binary files (.exe / Windows binary) are strictly forbidden.' };
    }
    if (buffer.length >= 4 && buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
        return { isValid: false, error: 'Executable binary files (ELF) are strictly forbidden.' };
    }
    const fileHeaderStr = buffer.toString('utf8', 0, Math.min(buffer.length, 256)).toLowerCase();
    if (fileHeaderStr.includes('<?php') || fileHeaderStr.includes('<script') || fileHeaderStr.startsWith('#!/')) {
        return { isValid: false, error: 'Script files (.php, .sh, .js, etc.) are strictly forbidden.' };
    }
    if (fileHeaderStr.includes('<svg') || fileHeaderStr.includes('<html')) {
        return { isValid: false, error: 'HTML and SVG vector files are not permitted for security reasons.' };
    }
    // 2. Validate expected format by extension
    switch (extension) {
        case 'pdf': {
            // PDF header must start with %PDF- (0x25 0x50 0x44 0x46)
            if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
                return { isValid: true, detectedType: 'application/pdf' };
            }
            return { isValid: false, error: 'File header does not match valid PDF document signature.' };
        }
        case 'jpg':
        case 'jpeg': {
            // JPEG header starts with FF D8 FF
            if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
                return { isValid: true, detectedType: 'image/jpeg' };
            }
            return { isValid: false, error: 'File header does not match valid JPEG image signature.' };
        }
        case 'png': {
            // PNG header starts with 89 50 4E 47 0D 0A 1A 0A
            if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
                return { isValid: true, detectedType: 'image/png' };
            }
            return { isValid: false, error: 'File header does not match valid PNG image signature.' };
        }
        case 'webp': {
            // WEBP header RIFF....WEBP (0x52 0x49 0x46 0x46 ... 0x57 0x41 0x56 0x45 or WEBP)
            if (buffer.length >= 12 &&
                buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
                buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
                return { isValid: true, detectedType: 'image/webp' };
            }
            return { isValid: false, error: 'File header does not match valid WEBP image signature.' };
        }
        case 'xls': {
            // XLS (OLE Compound File) starts with D0 CF 11 E0 A1 B1 1A E1
            if (buffer.length >= 8 && buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0) {
                return { isValid: true, detectedType: 'application/vnd.ms-excel' };
            }
            return { isValid: false, error: 'File header does not match valid Excel .xls spreadsheet signature.' };
        }
        case 'xlsx': {
            // XLSX is a ZIP container: starts with PK\x03\x04 (0x50 0x4B 0x03 0x04)
            if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
                return { isValid: true, detectedType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
            }
            return { isValid: false, error: 'File header does not match valid Excel .xlsx spreadsheet signature.' };
        }
        case 'csv': {
            // CSV is plain text. Ensure no binary nulls or non-printable binary junk in the header.
            let nullCount = 0;
            for (let i = 0; i < Math.min(buffer.length, 256); i++) {
                if (buffer[i] === 0x00)
                    nullCount++;
            }
            if (nullCount > 2) {
                return { isValid: false, error: 'CSV file contains binary executable data instead of text.' };
            }
            return { isValid: true, detectedType: 'text/csv' };
        }
        default:
            return { isValid: false, error: `Unsupported file extension: .${extension}` };
    }
}
