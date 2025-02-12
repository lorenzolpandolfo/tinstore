const packageCache = new Map();

export const getCachedPackage = (key) => {
  return packageCache.get(key);
};

export const setCachedPackage = (key, value) => {
  packageCache.set(key, value);
};

export const hasCache = (key) => {
  return packageCache.has(key);
};
