import fs from "fs";

import { readCacheData, writeCacheData } from "../utils/fileUtils.js";
import { CACHE_DIR, CACHE_FILE_PATH } from "../config/cachePath.js";

let inMemoryCacheData;

export const getInMemoryCacheData = async () => {
  return inMemoryCacheData;
}

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

export const addPackage = async (packageName) => {
  let jsonData = await readCacheData();
  if (!jsonData || !jsonData.Sources[0]?.Packages) {
    console.error("[Error] Estrutura do cache inválida.");
    return false;
  }

  const packages = jsonData.Sources[0].Packages;

  if (packages.find((pkg) => pkg.PackageIdentifier === packageName)) {
    console.log(`[Warn] Pacote '${packageName}' já existe no cache.`);
    return false;
  }

  packages.push({
    PackageIdentifier: packageName,
    InstalledDate: new Date().toISOString(),
  });

  await writeJsonFile(jsonData);
  console.log(`[Info] Pacote '${packageName}' adicionado ao cache.`);
  await updateCacheData();
  return true;
};

export const removePackage = async (packageName) => {
  let jsonData = await readCacheData();
  if (!jsonData || !jsonData.Sources[0]?.Packages) {
    console.error("[Error] Estrutura do cache inválida.");
    return false;
  }

  const packages = jsonData.Sources[0].Packages;

  // Encontra o índice do pacote para remover
  const packageIndex = packages.findIndex(
    (pkg) => pkg.PackageIdentifier === packageName
  );
  if (packageIndex === -1) {
    console.log(`[Warn] Pacote '${packageName}' não encontrado no cache.`);
    return false;
  }

  // Remove o pacote
  packages.splice(packageIndex, 1);

  // Escreve o JSON atualizado no arquivo
  await writeCacheData(jsonData);
  console.log(`[Info] Pacote '${packageName}' removido do cache.`);
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

export const createCache = async (win) => {
  console.log("criando cache");
  try {
    win.webContents.send("cache-generate-modal", true);

    const command = `cd "${CACHE_DIR}" && winget export --source winget -o "${cacheFilename}"`;
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
    win.webContents.send("cache-generate-modal", false);

    console.log("[Cache] Trying to loading just generated cache");

    await updateCacheData();

    console.log("[Cache Error] Error loading new cache");
  }
};
