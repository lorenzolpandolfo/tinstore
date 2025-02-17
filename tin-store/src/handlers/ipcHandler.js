import { dialog, ipcMain } from "electron";
import {
  addPackage,
  findPackageById,
  getInMemoryCacheData,
  handleCache,
  regenerateCache,
  removePackage,
} from "../services/packageCacheService.js";
import { exec } from "child_process";
import { searchPackage } from "../services/packageSearchService.js";
import { githubToken, loadKey, saveKey } from "../utils/tokenUtils.js";

const isInstalled = (pkg) => {
  return new Promise((resolve, reject) => {
    const command = `winget list ${pkg}`;

    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        return resolve(null);
      }
      resolve(stdout.toLowerCase().includes(pkg.toLowerCase()));
    });
  });
};

export const registerHandlers = (win) => {
  ipcMain.on("cache-generate-process", () => {
    handleCache(win);
  });

  ipcMain.on("cache-regenerate", async () => {
    regenerateCache(win);
  });

  ipcMain.handle("get-packages-in-cache", async () => {
    return await getInMemoryCacheData();
  });

  ipcMain.handle("check-packages-in-cache", async (event, packages) => {
    const jsonData = await getInMemoryCacheData();
    if (!jsonData) return;
    console.log("[check-packages-in-cache] Finding packages in cache");

    try {
      const results = await Promise.all(
        packages.map(async (pkg) => {
          const foundPackage = findPackageById(
            jsonData.Sources[0]?.Packages,
            pkg
          );
          return {
            ...pkg,
            installed: !!foundPackage,
          };
        })
      );
      return results;
    } catch (error) {
      console.error("Erro ao verificar pacotes no cache:", error);
      return [];
    }
  });

  ipcMain.on("run-command", (event, command, pkg) => {
    event.sender.send("installation-status-change", pkg.packageName);

    const installing = command.includes("winget install ");
    const uninstalling = command.includes("winget uninstall ");

    exec(command, async (error, stdout, stderr) => {
      if (error || stderr) {
        event.sender.send("installation-status-change", pkg.packageName);

        const alreadyInstalled = await isInstalled(pkg.packageId);

        if (installing && alreadyInstalled) {
          dialog.showMessageBox({
            type: "error",
            title: "Installation error",
            message: "package already installed",
          });
          return;
        }

        if (uninstalling && !alreadyInstalled) {
          dialog.showMessageBox({
            type: "error",
            title: "Installation error",
            message: "package already uninstalled",
          });
          return;
        }

        dialog.showMessageBox({
          type: "error",
          title: "Installation error",
          message: error.message || stderr,
        });
        return;
      }

      if (uninstalling) {
        await removePackage(pkg.packageId);

        dialog.showMessageBox({
          type: "info",
          title: "Uninstall complete",
          message: "The uninstall process was successful",
        });
      }

      if (installing) {
        await addPackage(pkg);

        dialog.showMessageBox({
          type: "info",
          title: "Installation complete",
          message: "The installation process was successful",
        });
      }

      event.sender.send("installation-status-change", pkg.packageName);
    });
  });

  ipcMain.handle("search-package", async (event, packageName) => {
    const result = await searchPackage(
      packageName,
      (await githubToken) || (await loadKey())
    );
    return result;
  });

  ipcMain.handle("change-token", async (event, token) => {
    await saveKey(token);
    await loadKey();
  });

  ipcMain.handle("get-token", async () => {
    return await loadKey();
  });
};
