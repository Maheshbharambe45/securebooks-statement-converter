import fs from 'fs';
import path from 'path';

export class Logger {
  private static formatMessage(level: string, message: string, meta?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    let metaString = '';
    if (meta) {
      // Redact any potentially sensitive keys
      const sanitizedMeta: Record<string, any> = {};
      for (const [key, value] of Object.entries(meta)) {
        if (['content', 'body', 'data', 'buffer', 'secret', 'password', 'token', 'account'].includes(key.toLowerCase())) {
          sanitizedMeta[key] = '[REDACTED]';
        } else {
          sanitizedMeta[key] = value;
        }
      }
      metaString = ` ${JSON.stringify(sanitizedMeta)}`;
    }
    return `[${timestamp}] [${level}] ${message}${metaString}`;
  }

  public static info(message: string, meta?: Record<string, any>): void {
    console.log(this.formatMessage('INFO', message, meta));
  }

  public static warn(message: string, meta?: Record<string, any>): void {
    console.warn(this.formatMessage('WARN', message, meta));
  }

  public static error(message: string, meta?: Record<string, any>): void {
    console.error(this.formatMessage('ERROR', message, meta));
  }
}
