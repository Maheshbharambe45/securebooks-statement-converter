"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubmissionTempDir = getSubmissionTempDir;
exports.ensureSubmissionTempDir = ensureSubmissionTempDir;
exports.cleanupSubmissionTempDir = cleanupSubmissionTempDir;
exports.startBackgroundRetentionSweeper = startBackgroundRetentionSweeper;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const logger_js_1 = require("../../utils/logger.js");
const BASE_TEMP_DIR = path_1.default.join(os_1.default.tmpdir(), 'secure-books-uploads');
function getSubmissionTempDir(submissionId) {
    return path_1.default.join(BASE_TEMP_DIR, submissionId);
}
function ensureSubmissionTempDir(submissionId) {
    const dirPath = getSubmissionTempDir(submissionId);
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
    }
    return dirPath;
}
function cleanupSubmissionTempDir(submissionId) {
    const dirPath = getSubmissionTempDir(submissionId);
    try {
        if (fs_1.default.existsSync(dirPath)) {
            fs_1.default.rmSync(dirPath, { recursive: true, force: true });
            logger_js_1.Logger.info(`Cleaned up temporary submission directory`, { submissionId });
        }
    }
    catch (err) {
        logger_js_1.Logger.error(`Failed to cleanup temporary submission directory`, { submissionId, error: err.message });
    }
}
function startBackgroundRetentionSweeper() {
    const retentionMinutes = parseInt(process.env.TEMP_FILE_RETENTION_MINUTES || '30', 10);
    const sweepIntervalMs = 10 * 60 * 1000; // Run every 10 minutes
    logger_js_1.Logger.info(`Starting background temporary file retention sweeper (retention: ${retentionMinutes} minutes)`);
    return setInterval(() => {
        try {
            if (!fs_1.default.existsSync(BASE_TEMP_DIR))
                return;
            const subDirs = fs_1.default.readdirSync(BASE_TEMP_DIR);
            const now = Date.now();
            const maxAgeMs = retentionMinutes * 60 * 1000;
            for (const subDir of subDirs) {
                const fullPath = path_1.default.join(BASE_TEMP_DIR, subDir);
                try {
                    const stats = fs_1.default.statSync(fullPath);
                    const ageMs = now - stats.mtimeMs;
                    if (ageMs > maxAgeMs) {
                        fs_1.default.rmSync(fullPath, { recursive: true, force: true });
                        logger_js_1.Logger.info(`Abandoned temporary submission directory purged by sweeper`, { subDir, ageMinutes: Math.round(ageMs / 60000) });
                    }
                }
                catch (subErr) {
                    // ignore stat/rm errors for isolated items
                }
            }
        }
        catch (err) {
            logger_js_1.Logger.error('Error during background temporary file cleanup sweep', { error: err.message });
        }
    }, sweepIntervalMs);
}
