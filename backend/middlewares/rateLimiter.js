import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from '../config/redis.js';

// Helper to create rate limiter with optional Redis store
const createRateLimiter = (options) => {
  const redisClient = getRedisClient();
  
  const limiterConfig = {
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      message: options.message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  };

  // Use Redis store if available, otherwise use memory store
  if (redisClient && redisClient.isOpen) {
    limiterConfig.store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: options.prefix || 'rl:'
    });
  }

  return rateLimit(limiterConfig);
};

// Auth routes limiter - 5 requests per 15 minutes
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  prefix: 'rl:auth:'
});

// General API limiter - 100 requests per 15 minutes
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  prefix: 'rl:api:'
});

// Strict limiter for sensitive operations - 3 requests per hour
export const strictLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Rate limit exceeded. Please try again later.',
  prefix: 'rl:strict:'
});

export default {
  authLimiter,
  apiLimiter,
  strictLimiter
};
