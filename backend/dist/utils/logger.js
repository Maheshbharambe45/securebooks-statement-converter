"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        let metaString = '';
        if (meta) {
            // Redact any potentially sensitive keys
            const sanitizedMeta = {};
            for (const [key, value] of Object.entries(meta)) {
                if (['content', 'body', 'data', 'buffer', 'secret', 'password', 'token', 'account'].includes(key.toLowerCase())) {
                    sanitizedMeta[key] = '[REDACTED]';
                }
                else {
                    sanitizedMeta[key] = value;
                }
            }
            metaString = ` ${JSON.stringify(sanitizedMeta)}`;
        }
        return `[${timestamp}] [${level}] ${message}${metaString}`;
    }
    static info(message, meta) {
        console.log(this.formatMessage('INFO', message, meta));
    }
    static warn(message, meta) {
        console.warn(this.formatMessage('WARN', message, meta));
    }
    static error(message, meta) {
        console.error(this.formatMessage('ERROR', message, meta));
    }
}
exports.Logger = Logger;
