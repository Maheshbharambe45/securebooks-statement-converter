"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_js_1 = require("../utils/logger.js");
function errorHandler(err, req, res, next) {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred during document submission processing.';
    logger_js_1.Logger.error('Unhandled request error in submission pipeline', {
        status,
        message,
        path: req.path,
        ip: req.ip,
    });
    res.status(status).json({
        success: false,
        error: message,
    });
}
