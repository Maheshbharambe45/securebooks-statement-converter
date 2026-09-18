import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred during document submission processing.';

  Logger.error('Unhandled request error in submission pipeline', {
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
