import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from "electron";
import { exec } from "child_process";

import axios from "axios";
import yaml from "js-yaml";
import path from "path";

import GITHUB_TOKEN from "./secret.js";
import compareVersions from "./utils/compareVersions.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

import fs from "fs";

import util from "util";
const execPromise = util.promisify(exec);


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cacheDir = path.join(__dirname, "cache");
const cacheFilename = "installed-packages.json";

const linux = false;

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL("http://localhost:5173/");

  // adicionar em alguma versao 1.0.0
  // Menu.setApplicationMenu(null);

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
};

app.whenReady().then(() => {
  createWindow();
});

ipcMain.on("cache-generate-process", () => {
    handleCache();
});

const handleCache = () => {
  if (!hasCache()) {
    createCache();
  }
};

const hasCache = () => {
  const cacheFile = path.join(cacheDir, cacheFilename);

  return fs.existsSync(cacheDir) && fs.existsSync(cacheFile);
};


const createCache = async () => {
  try {
    win.webContents.send("cache-generate-modal", true);

    const command = `cd "${cacheDir}" && winget export --source winget -o "${cacheFilename}"`;
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
    // poderia atualizar a lista do cache adicionando ou removendo o pacote
    win.webContents.send("cache-generate-modal", false);
  }
};



const packageCache = new Map();

ipcMain.handle("search-package", async (event, packageName) => {
  try {
    const cachedPackage = packageCache.get(packageName);
    if (cachedPackage) return cachedPackage;

    const url = `https://api.github.com/search/code?q=${packageName}+extension:yaml+repo:microsoft/winget-pkgs`;
    const headers = { Authorization: `token ${GITHUB_TOKEN}` };
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      const results = response.data.items;

      if (!results.length) return { message: "No packages found." };

      const packageDataPromises = results.map((item) => fetchYamlData(item, headers));
      const packageData = (await Promise.all(packageDataPromises)).filter(Boolean);

      const uniquePackages = deduplicatePackages(packageData);

      packageCache.set(packageName, uniquePackages);

      return uniquePackages;
    }
  } catch (error) {
    return { error: `Failed to search package: ${error.message}` };
  }
});

async function fetchYamlData(item, headers) {
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
      packageName: data.PackageName || data.PackageIdentifier.split(".").join(" ") || "N/A",
      publisher: data.Publisher,
      version: data.PackageVersion,
      description: data.ShortDescription,
      publisherUrl: data.PublisherUrl,
      packageUrl: data.PackageUrl,
    };

    packageCache.set(item.url, packageInfo);
    return packageInfo;
  } catch (error) {
    console.error(`Error loading YAML from ${yamlUrl}: ${error.message}`);
    return null;
  }
}

function deduplicatePackages(packageData) {
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

ipcMain.on("run-command", (event, command, packageName) => {
  event.sender.send("installation-status-change", true, packageName);

  exec(command, (error, stdout, stderr) => {
    if (!linux) {
      if (error || stderr) {
        event.sender.send("installation-status-change", false, packageName);
      }
      if (error) {
        dialog.showMessageBox({
          type: "error",
          title: "Installation error",
          message: error.message,
        });
        event.reply("command-result", `Error: ${error.message}`);
        return;
      }
      if (stderr) {
        dialog.showMessageBox({
          type: "error",
          title: "Installation error",
          message: stderr,
        });
        event.reply("command-result", `Stderr: ${stderr}`);
        return;
      }
      event.sender.send("installation-status-change", false, packageName);
    }

    dialog.showMessageBox({
      type: "info",
      title: "Installation complete",
      message: "The installation process was successful",
    });
    event.reply("command-result", stdout);
  });
});

// isso tudo podia ir para um utils
const readFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.log("[Warn] Cache not found: " + err);
        resolve(false);
      } else {
        resolve(data);
      }
    });
  });
};

const parseJson = (data) => {
  if (!data) return;
  try {
    return JSON.parse(data);
  } catch (err) {
    console.log("Erro ao analisar JSON do Cache " + err)
    return false;
  }
};

const getPackages = (jsonData) => {
  if (!jsonData) return;

  const packages = jsonData?.Sources[0]?.Packages;
  if (!packages) {
    console.log("[Error] Node 'Sources.Packages' not found in cache.");
    return false;
  }
  return packages;
};

const findPackageById = (packages, pkg) => {
  for (const key in packages) {
    if (packages.hasOwnProperty(key)) {
      const packageObj = packages[key];
      if (packageObj.PackageIdentifier === pkg.packageId) {
        return packageObj;
      }
    }
  }
  return null;
};

const filePath = path.join(__dirname, '/cache/installed-packages.json');
const cacheData = await readFile(filePath);
let jsonData = false
let packages = false

if (cacheData) {
  jsonData = parseJson(cacheData);
  packages = getPackages(jsonData);
}

const searchPackage = async (pkg) => {
  
  try {
    const foundPackage = findPackageById(packages, pkg);

    return {
      ...pkg,
      installed: foundPackage ? true : false,
    };
  } catch (error) {
    console.error(error);
    
    return {
      ...pkg,
      installed: false,
    };
  }
};

ipcMain.handle("check-packages-in-cache", async (event, packages) => {
  if (!jsonData) return;
  try {
    const results = await Promise.all(
      packages.map(async (packageId) => {
        return await searchPackage(packageId);
      })
    );
    return results;
  } catch (error) {
    console.error("Erro ao verificar pacotes no cache:", error);
    return [];
  }
});