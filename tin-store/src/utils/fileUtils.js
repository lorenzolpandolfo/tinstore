import fs from "fs";
import { CACHE_FILE_PATH } from "../config/cachePath.js";

export const readCacheData = async () => {
  try {
    const data = await fs.promises.readFile(CACHE_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.log('[Warn] Falha ao ler o cache:', err);
    return false;
  }
};

export const writeCacheData = async (data) => {
  try {
    await fs.promises.writeFile(CACHE_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.log('[Error] Falha ao salvar o cache:', err);
    return false;
  }
};
