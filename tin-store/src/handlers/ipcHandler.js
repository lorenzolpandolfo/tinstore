import { dialog, ipcMain } from "electron";
import {
  findPackageById,
  getInMemoryCacheData,
  handleCache,
  removePackage,
} from "../services/packageCacheService.js";
import { exec } from "child_process";
import { searchPackage } from "../services/packageSearchService.js";
import { GITHUB_TOKEN } from "../../secret.js";

export const registerHandlers = (win) => {
  ipcMain.on("cache-generate-process", () => {
    handleCache(win);
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

    exec(command, async (error, stdout, stderr) => {
      if (error || stderr) {
        event.sender.send("installation-status-change", pkg.packageName);

        dialog.showMessageBox({
          type: "error",
          title: "Installation error",
          message: error.message || stderr,
        });
        return;
      }

      if (command.includes("winget uninstall ")) {
        await removePackage(pkg.packageId);

        dialog.showMessageBox({
          type: "info",
          title: "Uninstall complete",
          message: "The uninstall process was successful",
        });
      }

      if (command.includes("winget install ")) {
        await addPackage(pkg.packageId);

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
    const result = await searchPackage(packageName, GITHUB_TOKEN);
    return result;
  });
};
