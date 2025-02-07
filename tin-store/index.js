import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import GITHUB_TOKEN from "./secret.js";
import axios from "axios";
import yaml from "js-yaml";

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

ipcMain.handle("search-package", async (event, packageName) => {
  console.log("[-] Searching for", packageName);

  try {
    const url = `https://api.github.com/search/code?q=${packageName}+extension:yaml+repo:microsoft/winget-pkgs`;
    const headers = { Authorization: `token ${GITHUB_TOKEN}` };
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const results = response.data.items;

      if (!results.length) return { message: "No packages found." };

      const sortedResults = results.sort((a, b) => {
        const isVersionA = a.path.includes("version.yaml");
        const isVersionB = b.path.includes("version.yaml");
        return isVersionA === isVersionB ? 0 : isVersionA ? -1 : 1;
      });

      const packageData = [];
      for (const item of sortedResults) {
        if (
          item.path.includes(".validation") ||
          item.path.includes(".installer")
        )
          continue;
        const yamlUrl = item.html_url
          .replace("github.com", "raw.githubusercontent.com")
          .replace("/blob/", "/");
        const yamlResponse = await axios.get(yamlUrl, { headers });
        const data = yaml.load(yamlResponse.data);
        packageData.push({
          packageId: data.PackageIdentifier,
          packageName:
            data.PackageName ||
            data.PackageIdentifier.split(".").join(" ") ||
            "N/A",
          publisher: data.Publisher,
          version: data.PackageVersion,
          description: data.Description,
          homepage: data.Homepage,
        });
      }
      return packageData;
    }
  } catch (error) {
    return { error: `Failed to search package: ${error.message}` };
  }
});
