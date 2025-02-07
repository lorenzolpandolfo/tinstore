import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import GITHUB_TOKEN from "./secret.js";
import axios from "axios";
import yaml from "js-yaml";

import compareVersions from "./utils/compareVersions.js";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.js"),
    },
  });

  win.loadURL("http://localhost:5173/");
};

app.whenReady().then(() => {
  createWindow();
});

const packageCache = new Map();

ipcMain.handle("search-package", async (event, packageName) => {
  console.log("[-] Searching for", packageName);

  try {
    const url = `https://api.github.com/search/code?q=${packageName}+extension:yaml+repo:microsoft/winget-pkgs`;
    const headers = { Authorization: `token ${GITHUB_TOKEN}` };
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const results = response.data.items;

      if (!results.length) return { message: "No packages found." };

      const packageDataPromises = results.map(async (item) => {
        if (packageCache.has(item.url)) {
          return packageCache.get(item.url);
        }

        const yamlUrl = item.html_url
          .replace("github.com", "raw.githubusercontent.com")
          .replace("/blob/", "/");

        try {
          const yamlResponse = await axios.get(yamlUrl, { headers });
          const data = yaml.load(yamlResponse.data);

          const packageInfo = {
            packageId: data.PackageIdentifier,
            packageName:
              data.PackageName ||
              data.PackageIdentifier.split(".").join(" ") ||
              "N/A",
            publisher: data.Publisher,
            version: data.PackageVersion,
            description: data.ShortDescription,
            homepage: data.Homepage,
          };

          packageCache.set(item.url, packageInfo);

          return packageInfo;
        } catch (error) {
          console.error(`Error loading YAML from ${yamlUrl}: ${error.message}`);
          return null;
        }
      });

      const packageData = (await Promise.all(packageDataPromises)).filter(
        Boolean
      );

      const seenPackages = new Map();

      packageData.forEach((pkg) => {
        if (!seenPackages.has(pkg.packageName)) {
          seenPackages.set(pkg.packageName, pkg);
        } else {
          const existingPackage = seenPackages.get(pkg.packageName);
          if (compareVersions(pkg.version, existingPackage.version) > 0) {
            seenPackages.set(pkg.packageName, pkg);
          }
        }
      });

      return Array.from(seenPackages.values());
    }
  } catch (error) {
    return { error: `Failed to search package: ${error.message}` };
  }
});
