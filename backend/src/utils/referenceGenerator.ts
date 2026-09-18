import crypto from 'crypto';

export function generateSubmissionReference(): string {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `SB-${year}-${randomHex}`;
}
