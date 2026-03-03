import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';

const isDev = process.env.NODE_ENV !== 'production';

/* ================= Helper ================= */
const createRedisStore = (prefix) => {
  try {
    if (!redisClient) return undefined;

    return new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix
    });
  } catch (err) {
    console.error('Failed to initialize RedisStore:', err?.message || err);
    return undefined;
  }
};

/* ================= API LIMITER ================= */
const apiStore = createRedisStore('rl:api:');

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,   // 🔥 high limit in dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  ...(apiStore && { store: apiStore })
});

/* ================= AUTH LIMITER ================= */
const authStore = createRedisStore('rl:auth:');

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 5,   // 🔥 dev unlimited
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  ...(authStore && { store: authStore })
});