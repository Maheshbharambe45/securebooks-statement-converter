import rateLimit from 'express-rate-limit';

export const submissionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 20, // Max 20 submissions per IP in 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many document submission attempts from this IP address. Please try again after 15 minutes.',
  },
});
