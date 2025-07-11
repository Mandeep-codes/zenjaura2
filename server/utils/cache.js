import NodeCache from 'node-cache';

// Create cache instance with 10 minute default TTL
const cache = new NodeCache({ 
  stdTTL: 600, // 10 minutes
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Better performance
});

export const cacheKeys = {
  BOOKS_LIST: 'books_list',
  BOOK_STATS: 'book_stats',
  FEATURED_BOOKS: 'featured_books',
  EVENTS_LIST: 'events_list',
  PACKAGES_LIST: 'packages_list',
  USER_PROFILE: 'user_profile',
  ADMIN_STATS: 'admin_stats'
};

export const getCacheKey = (base, params = {}) => {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return paramString ? `${base}:${paramString}` : base;
};

export const get = (key) => {
  try {
    return cache.get(key);
  } catch (error) {
    console.error('Cache get error:', error);
    return undefined;
  }
};

export const set = (key, value, ttl) => {
  try {
    return cache.set(key, value, ttl);
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

export const del = (key) => {
  try {
    return cache.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
    return 0;
  }
};

export const flush = () => {
  try {
    cache.flushAll();
    return true;
  } catch (error) {
    console.error('Cache flush error:', error);
    return false;
  }
};

export const getStats = () => {
  return cache.getStats();
};

export default cache;