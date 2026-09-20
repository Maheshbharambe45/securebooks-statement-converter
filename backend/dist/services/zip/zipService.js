"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipService = void 0;
exports.sanitizeZipEntryName = sanitizeZipEntryName;
const archiver_1 = __importDefault(require("archiver"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_js_1 = require("../../utils/logger.js");
// Safe single ZIP raw size threshold (6.5 MB raw ZIP => ~8.7 MB Base64 MIME email)
const SAFE_MAX_ZIP_PART_BYTES = 6.5 * 1024 * 1024;
function sanitizeZipEntryName(entryName) {
    // Remove drive letters e.g. C:\ and leading slashes
    let sanitized = entryName.replace(/^[a-zA-Z]:[/\\]/, '').replace(/^[/\\]+/, '');
    // Split path segments and filter out '..' and '.'
    const segments = sanitized
        .split(/[/\\]/)
        .filter((seg) => seg !== '..' && seg !== '.' && seg.trim().length > 0)
        .map((seg) => seg.replace(/[^a-zA-Z0-9._ -]/g, '_'));
    return segments.join('/') || 'unnamed_file';
}
class ZipService {
    generateClientDetailsText(options, partIndex, totalParts, partFiles) {
        const timestamp = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        const lines = [
            '====================================================',
            'SECURE BOOKS CLIENT DOCUMENT SUBMISSION',
            '====================================================',
            `Submission Reference : ${options.reference}`,
            `Form Title           : ${options.formConfig.title}`,
            `Client Name          : ${options.fieldValues.clientName || 'N/A'}`,
            `Period Start Date    : ${options.fieldValues.startDate || 'N/A'}`,
            `Period End Date      : ${options.fieldValues.endDate || 'N/A'}`,
            `Selection Type       : ${options.fieldValues.selectionType || 'N/A'}`,
            `Selected Month/Quarter: ${options.fieldValues.selectedPeriod || 'N/A'}`,
            `Client Email         : ${options.clientEmail || 'N/A'}`,
            `Submitted Date       : ${timestamp}`,
            `Package Part         : Part ${partIndex} of ${totalParts}`,
            `Attached Files (Part): ${partFiles.length}`,
            '====================================================',
            '',
            'DOCUMENT CATEGORIES STATUS SUMMARY:',
            '----------------------------------------------------',
        ];
        for (const category of options.formConfig.documentCategories) {
            const catState = options.categoryStatuses[category.id] || { status: 'na' };
            const totalCatFiles = options.files.filter((f) => f.category === category.id);
            const partCatFiles = partFiles.filter((f) => f.category === category.id);
            if (catState.status === 'na') {
                lines.push(`${category.name}: Status: N/A (Documents not available)`);
            }
            else {
                lines.push(`${category.name}: Status: AVAILABLE (${totalCatFiles.length} total file(s), ${partCatFiles.length} file(s) in this ZIP part)`);
                for (const f of partCatFiles) {
                    lines.push(`  - ${f.originalName} (${(f.sizeBytes / (1024 * 1024)).toFixed(2)} MB)`);
                }
            }
            if (catState.notes && catState.notes.trim()) {
                lines.push(`  Notes: ${catState.notes.trim()}`);
            }
        }
        if (options.additionalNotes && options.additionalNotes.trim()) {
            lines.push('');
            lines.push('ADDITIONAL NOTES FOR BOOKKEEPER:');
            lines.push('----------------------------------------------------');
            lines.push(options.additionalNotes.trim());
        }
        return lines.join('\r\n');
    }
    writeSingleZip(zipPath, entries) {
        return new Promise((resolve, reject) => {
            const output = fs_1.default.createWriteStream(zipPath);
            const archive = (0, archiver_1.default)('zip', { zlib: { level: 6 } });
            output.on('close', () => {
                resolve(archive.pointer());
            });
            output.on('error', (err) => {
                reject(err);
            });
            archive.on('error', (err) => {
                reject(err);
            });
            archive.pipe(output);
            for (const entry of entries) {
                const safeName = sanitizeZipEntryName(entry.name);
                if (entry.content !== undefined) {
                    archive.append(entry.content, { name: safeName });
                }
                else if (entry.filePath && fs_1.default.existsSync(entry.filePath)) {
                    archive.file(entry.filePath, { name: safeName });
                }
            }
            archive.finalize();
        });
    }
    async buildSubmissionZipPackages(options) {
        if (!fs_1.default.existsSync(options.tempDir)) {
            fs_1.default.mkdirSync(options.tempDir, { recursive: true });
        }
        const totalFilesSize = options.files.reduce((sum, f) => sum + f.sizeBytes, 0);
        // Group files into parts if total size exceeds safe single ZIP threshold
        const filePartGroups = [];
        if (options.files.length === 0 || totalFilesSize <= SAFE_MAX_ZIP_PART_BYTES) {
            filePartGroups.push(options.files);
        }
        else {
            let currentGroup = [];
            let currentGroupSize = 0;
            for (const file of options.files) {
                if (currentGroup.length > 0 && currentGroupSize + file.sizeBytes > SAFE_MAX_ZIP_PART_BYTES) {
                    filePartGroups.push(currentGroup);
                    currentGroup = [file];
                    currentGroupSize = file.sizeBytes;
                }
                else {
                    currentGroup.push(file);
                    currentGroupSize += file.sizeBytes;
                }
            }
            if (currentGroup.length > 0) {
                filePartGroups.push(currentGroup);
            }
        }
        const totalParts = filePartGroups.length;
        const parts = [];
        for (let idx = 0; idx < totalParts; idx++) {
            const partIndex = idx + 1;
            const partFiles = filePartGroups[idx];
            const partSuffix = totalParts > 1 ? `_Part_${partIndex}_of_${totalParts}` : '';
            const zipFilename = `SecureBooks_Submission_${options.reference}${partSuffix}.zip`;
            const zipPath = path_1.default.join(options.tempDir, zipFilename);
            const entries = [];
            // 1. Add Client Details.txt metadata
            const detailsTxtContent = this.generateClientDetailsText(options, partIndex, totalParts, partFiles);
            entries.push({
                name: 'Client Details.txt',
                content: detailsTxtContent,
            });
            // 2. Add Category files inside category subdirectories
            for (const file of partFiles) {
                const catConfig = options.formConfig.documentCategories.find((c) => c.id === file.category);
                const categoryFolderName = catConfig ? catConfig.name.replace(/[^a-zA-Z0-9._ -]/g, '_') : file.category;
                const safeFileName = file.sanitizedName || path_1.default.basename(file.originalName).replace(/[^a-zA-Z0-9._ -]/g, '_');
                entries.push({
                    name: `${categoryFolderName}/${safeFileName}`,
                    filePath: file.tempFilePath,
                });
            }
            const sizeBytes = await this.writeSingleZip(zipPath, entries);
            logger_js_1.Logger.info(`Generated submission ZIP archive`, {
                reference: options.reference,
                partIndex,
                totalParts,
                zipFilename,
                sizeBytes,
                fileCount: partFiles.length,
            });
            parts.push({
                partIndex,
                totalParts,
                zipPath,
                zipFilename,
                fileCount: partFiles.length,
                sizeBytes,
            });
        }
        return {
            reference: options.reference,
            isMultiPart: totalParts > 1,
            parts,
        };
    }
}
exports.ZipService = ZipService;
