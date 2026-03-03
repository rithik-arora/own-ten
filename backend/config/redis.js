import dotenv from 'dotenv'
dotenv.config()

import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl
});

let hasLoggedConnect = false;

redisClient.on('error', (err) => {
  console.error('Redis client error:', err?.message || err);
});

redisClient.on('connect', () => {
  if (!hasLoggedConnect) {
    console.log('Redis connected');
    hasLoggedConnect = true;
  }
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    console.error('Failed to connect to Redis:', err?.message || err);
  }
};

// Trigger connection on import, but don't block app startup
connectRedis();

export default redisClient;

