import { LRUCache } from "lru-cache";


const MAX_SIZE_CACHE = 100;
const FIVE_MIN_MS = 1000 * 5 * 60;

const options = {
  max: MAX_SIZE_CACHE,
  maxAge: FIVE_MIN_MS,
};

const packageCache = new LRUCache(options);

export const getCachedPackage = (key) => {
  return packageCache.get(key);
};

export const setCachedPackage = (key, value) => {
  packageCache.set(key, value);
};

export const hasCache = (key) => {
  return packageCache.has(key);
};
