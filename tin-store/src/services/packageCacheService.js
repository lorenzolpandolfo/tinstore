import fs from "fs";
import { dialog } from "electron";

import { readCacheData, writeCacheData } from "../utils/fileUtils.js";
import { CACHE_DIR, CACHE_FILE_PATH } from "../config/cachePath.js";
import { exec } from "child_process";
import util from "util";

let inMemoryCacheData;

export const getInMemoryCacheData = async () => {
  return inMemoryCacheData;
};

export const updateCacheData = async () => {
  const cacheData = await readCacheData();
  if (cacheData) {
    console.log("[Cache] data loaded correctly");
    inMemoryCacheData = cacheData;
    return cacheData;
  }
  return null;
};

export const findPackageById = (packages, pkg) => {
  return (
    packages.find(
      (packageObj) => packageObj.PackageIdentifier === pkg.packageId
    ) || null
  );
};

export const addPackage = async (pkg) => {
  let jsonData = await readCacheData();
  if (!jsonData || !jsonData.Sources[0]?.Packages) {
    console.error("[Error] Estrutura do cache inválida.");
    return false;
  }

  const packages = jsonData.Sources[0].Packages;

  if (packages.find((pkgIn) => pkgIn.PackageIdentifier === pkg)) {
    console.log(`[Warn] Pacote '${pkg.packageId}' já existe no cache.`);
    return false;
  }

  packages.push({
    PackageIdentifier: pkg.packageId,
    packageName: pkg.packageName,
    version: pkg.version,
    publisher: pkg.publisher,
    description: pkg.description,
    publisherUrl: pkg.publisherUrl,
    packageUrl: pkg.packageUrl,
    InstalledDate: new Date().toISOString(),
  });

  await writeCacheData(jsonData);
  console.log(`[Info] Pacote '${pkg.packageId}' adicionado ao cache.`);
  await updateCacheData();
  return true;
};

export const removePackage = async (pkg) => {
  const packageId = pkg.packageId;
  let jsonData = await readCacheData();
  if (!jsonData || !jsonData.Sources[0]?.Packages) {
    console.error("[Error] Estrutura do cache inválida.");
    return false;
  }

  const packages = jsonData.Sources[0].Packages;

  const packageIndex = packages.findIndex(
    (pkg) => pkg.PackageIdentifier === packageId
  );
  if (packageIndex === -1) {
    console.log(`[Warn] Package '${packageId}' not found on cache.`);
    return false;
  }

  packages.splice(packageIndex, 1);

  await writeCacheData(jsonData);
  console.log(`[Info] Package '${packageId}' removed from cache.`);
  await updateCacheData();
  return true;
};

export const handleCache = async (win) => {
  if (!hasCache()) {
    createCache(win);
  } else {
    await updateCacheData();
  }
};

export const hasCache = () => {
  return fs.existsSync(CACHE_DIR) && fs.existsSync(CACHE_FILE_PATH);
};

const execPromise = util.promisify(exec);

export const createCache = async (win) => {
  console.log("[Cache] Creating cache...");
  try {
    win.webContents.send("cache-generate-modal", true);

    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    const command = `cd "${CACHE_DIR}" && winget export --source winget -o installed-packages.json`;
    const { stderr } = await execPromise(command);

    if (stderr) {
      await dialog.showMessageBox({
        type: "error",
        title: "Generating cache error",
        message: stderr,
      });
    }
  } catch (error) {
    await dialog.showMessageBox({
      type: "error",
      title: "Generating cache error",
      message: error.message,
    });
  } finally {
    console.log("[Cache] Loading generated cache...");
    await updateCacheData();
    win.webContents.send("cache-generate-modal", false);
  }
};

export const regenerateCache = async (win) => {
  try {
    await fs.promises.access(CACHE_FILE_PATH).catch(() => null);
    await fs.promises.unlink(CACHE_FILE_PATH).catch(() => {});
    console.log(`[Rebuild Cache] Cache file removed: ${CACHE_FILE_PATH}`);
  } catch (err) {
    console.log("[Rebuild Cache] Error on removing cache file:", err);
  } finally {
    handleCache(win);
  }
};
