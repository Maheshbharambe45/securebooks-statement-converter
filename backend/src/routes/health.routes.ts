import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Secure Books Direct-to-Outlook Document Submission API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    storageMode: 'Stateless / Temporary Processing Only (Zero Permanent Document Storage)',
  });
});

export default router;
