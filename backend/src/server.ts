import app from './app.js';
import { Logger } from './utils/logger.js';
import { startBackgroundRetentionSweeper } from './services/cleanup/tempCleanup.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize background temporary file retention sweeper
const sweeperInterval = startBackgroundRetentionSweeper();

const server = app.listen(PORT, () => {
  Logger.info(`Secure Books Backend API running on port ${PORT}`);
  Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  Logger.info(`Email Architecture: AWS SES API (Region: ${process.env.AWS_REGION || 'ap-south-1'}, From: ${process.env.MAIL_FROM || 'mahesh_bharambe@outlook.com'}, To: ${process.env.MAIL_TO || 'mahesh_bharambe@outlook.com'})`);
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
