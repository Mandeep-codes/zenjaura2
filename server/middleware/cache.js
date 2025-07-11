import { get, set, getCacheKey } from '../utils/cache.js';

export const cacheMiddleware = (keyBase, ttl = 600) => {
  return (req, res, next) => {
    // Skip caching for authenticated requests that modify data
    if (req.method !== 'GET' || req.user) {
      return next();
    }

    const cacheKey = getCacheKey(keyBase, {
      ...req.query,
      ...req.params
    });

    const cachedData = get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache the response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        set(cacheKey, data, ttl);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

export const invalidateCache = (patterns) => {
  const cache = require('../utils/cache.js').default;
  const keys = cache.keys();
  
  patterns.forEach(pattern => {
    const regex = new RegExp(pattern);
    keys.forEach(key => {
      if (regex.test(key)) {
        cache.del(key);
      }
    });
  });
};