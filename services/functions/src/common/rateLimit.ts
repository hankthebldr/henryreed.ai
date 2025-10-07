import { RequestHandler } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const limiter = new RateLimiterMemory({ keyPrefix: 'unified_api', points: 100, duration: 60 });

export const rateLimit = (): RequestHandler => async (req, res, next) => {
  try {
    const key = (req.headers['x-user-id'] as string) || req.ip || 'anonymous';
    await limiter.consume(key);
    next();
  } catch (rej: any) {
    const secs = Math.round((rej?.msBeforeNext || 1000) / 1000);
    res.set('Retry-After', String(secs));
    res.status(429).json({ success: false, error: { code: 'rate-limit', message: 'Too many requests' } });
  }
};
