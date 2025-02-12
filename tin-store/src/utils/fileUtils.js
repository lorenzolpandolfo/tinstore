import fs from "fs";
import { CACHE_FILE_PATH } from "../config/cachePath.js";

let operationQueue = Promise.resolve();

export const readCacheData = () => {
  return new Promise((resolve) => {
    fs.readFile(CACHE_FILE_PATH, 'utf8', (err, data) => {
      if (err) {
        console.error('[Warn] Falha ao ler o cache:', err);
        resolve(false);
      } else {
        try {
          resolve(JSON.parse(data));
        } catch (parseError) {
          console.error('[Error] Erro ao analisar JSON:', parseError);
          resolve(false);
        }
      }
    });
  });
};

export const writeCacheData = (data) => {
  return new Promise((resolve, reject) => {
    operationQueue = operationQueue
      .then(() => new Promise((innerResolve, innerReject) => {
        fs.writeFile(CACHE_FILE_PATH, JSON.stringify(data, null, 2), 'utf8', (err) => {
          if (err) {
            console.error('[Error] Falha ao salvar o cache:', err);
            innerReject(err);
          } else {
            innerResolve(true);
          }
        });
      }))
      .then(resolve)
      .catch(reject);
  });
};
