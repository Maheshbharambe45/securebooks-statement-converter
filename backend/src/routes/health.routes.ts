import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Secure Books Document Submission API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    storageMode: 'Temporary Processing Only',
  });
});

export default router;
