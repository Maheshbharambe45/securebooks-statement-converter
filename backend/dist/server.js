"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const logger_js_1 = require("./utils/logger.js");
const tempCleanup_js_1 = require("./services/cleanup/tempCleanup.js");
const PORT = parseInt(process.env.PORT || '3000', 10);
// Initialize background temporary file retention sweeper
const sweeperInterval = (0, tempCleanup_js_1.startBackgroundRetentionSweeper)();
const server = app_js_1.default.listen(PORT, () => {
    logger_js_1.Logger.info(`Secure Books Backend API running on port ${PORT}`);
    logger_js_1.Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger_js_1.Logger.info(`Microsoft Graph Mode: ${process.env.MICROSOFT_CLIENT_ID ? 'Azure Entra ID Active' : 'Mock Mode Active (Local Testing)'}`);
});
// Graceful shutdown handling
const gracefulShutdown = (signal) => {
    logger_js_1.Logger.info(`Received ${signal}. Initiating graceful shutdown...`);
    clearInterval(sweeperInterval);
    server.close(() => {
        logger_js_1.Logger.info('HTTP server closed. Exiting process.');
        process.exit(0);
    });
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
