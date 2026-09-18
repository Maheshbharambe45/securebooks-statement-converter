import fs from 'fs';
import path from 'path';
import os from 'os';
import { Logger } from '../../utils/logger.js';

const BASE_TEMP_DIR = path.join(os.tmpdir(), 'secure-books-uploads');

export function getSubmissionTempDir(submissionId: string): string {
  return path.join(BASE_TEMP_DIR, submissionId);
}

export function ensureSubmissionTempDir(submissionId: string): string {
  const dirPath = getSubmissionTempDir(submissionId);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
  }
  return dirPath;
}

export function cleanupSubmissionTempDir(submissionId: string): void {
  const dirPath = getSubmissionTempDir(submissionId);
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      Logger.info(`Cleaned up temporary submission directory`, { submissionId });
    }
  } catch (err: any) {
    Logger.error(`Failed to cleanup temporary submission directory`, { submissionId, error: err.message });
  }
}

export function startBackgroundRetentionSweeper(): NodeJS.Timeout {
  const retentionMinutes = parseInt(process.env.TEMP_FILE_RETENTION_MINUTES || '30', 10);
  const sweepIntervalMs = 10 * 60 * 1000; // Run every 10 minutes

  Logger.info(`Starting background temporary file retention sweeper (retention: ${retentionMinutes} minutes)`);

  return setInterval(() => {
    try {
      if (!fs.existsSync(BASE_TEMP_DIR)) return;

      const subDirs = fs.readdirSync(BASE_TEMP_DIR);
      const now = Date.now();
      const maxAgeMs = retentionMinutes * 60 * 1000;

      for (const subDir of subDirs) {
        const fullPath = path.join(BASE_TEMP_DIR, subDir);
        try {
          const stats = fs.statSync(fullPath);
          const ageMs = now - stats.mtimeMs;
          if (ageMs > maxAgeMs) {
            fs.rmSync(fullPath, { recursive: true, force: true });
            Logger.info(`Abandoned temporary submission directory purged by sweeper`, { subDir, ageMinutes: Math.round(ageMs / 60000) });
          }
        } catch (subErr) {
          // ignore stat/rm errors for isolated items
        }
      }
    } catch (err: any) {
      Logger.error('Error during background temporary file cleanup sweep', { error: err.message });
    }
  }, sweepIntervalMs);
}
