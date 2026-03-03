import redisClient from '../config/redis.js';

/**
 * Generic Redis cache middleware.
 *
 * @param {string} keyPrefix - Prefix for cache key (e.g. "properties", "public", "property")
 * @param {number} ttlSeconds - Time to live in seconds
 * @returns {import('express').RequestHandler}
 */
export const cache = (keyPrefix, ttlSeconds) => {
  return async (req, res, next) => {
    // If Redis is not available, skip caching entirely
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    const key = `${keyPrefix}:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(key);

      if (cached) {
        console.log("cache hit",key);
        
        const parsed = JSON.parse(cached);
        const status = typeof parsed.status === 'number' ? parsed.status : 200;
        return res.status(status).json(parsed.body);
      }
      console.log("cache missed",key);
      
    } catch (err) {
      console.error('Redis cache read error:', err?.message || err);
      // Fallback to normal request handling
      return next();
    }

    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      try {
        const payload = {
          status: res.statusCode,
          body
        };

        await redisClient.setEx(
          key,
          ttlSeconds,
          JSON.stringify(payload)
        );
        console.log("cache saved",key);
        
      } catch (err) {
        console.error('Redis cache write error:', err?.message || err);
      }

      return originalJson(body);
    };

    return next();
  };
};

/**
 * Invalidate property-related cache keys.
 * This is used after mutations to keep cache fresh.
 */
export const invalidatePropertyCache = async () => {
  if (!redisClient || !redisClient.isOpen) return;

  const patterns = ['properties*', 'public*', 'property*'];

  try {
    for (const pattern of patterns) {
      const keys = await redisClient.keys(pattern);
      if (Array.isArray(keys) && keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (err) {
    console.error('Redis cache invalidation error:', err?.message || err);
  }
};

