import app from './app.js';
import { Logger } from './utils/logger.js';
import { startBackgroundRetentionSweeper } from './services/cleanup/tempCleanup.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize background temporary file retention sweeper
const sweeperInterval = startBackgroundRetentionSweeper();

const server = app.listen(PORT, () => {
  Logger.info(`Secure Books Backend API running on port ${PORT}`);
  Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  Logger.info(`Microsoft Graph Mode: ${process.env.MICROSOFT_CLIENT_ID ? 'Azure Entra ID Active' : 'Mock Mode Active (Local Testing)'}`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  Logger.info(`Received ${signal}. Initiating graceful shutdown...`);
  clearInterval(sweeperInterval);
  server.close(() => {
    Logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
