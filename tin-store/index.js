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

let cacheData = false;
let jsonData = false;
let packages = false;

const CACHE_PATH = path.join(__dirname, "/cache/installed-packages.json");

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

const handleCache = async () => {
  if (!hasCache()) {
    createCache();
  } else {
    await updateCacheData();
  }
};

const hasCache = () => {
  const cacheFile = path.join(cacheDir, cacheFilename);

  return fs.existsSync(cacheDir) && fs.existsSync(cacheFile);
};

const createCache = async () => {
  console.log("criando cache")
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
    win.webContents.send("cache-generate-modal", false);

    console.log("[Cache] Trying to loading just generated cache");
    
    await updateCacheData();
    
    console.log("[Cache Error] Error loading new cache");
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

      const packageDataPromises = results.map((item) =>
        fetchYamlData(item, headers)
      );
      const packageData = (await Promise.all(packageDataPromises)).filter(
        Boolean
      );

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
      packageName:
        data.PackageName ||
        data.PackageIdentifier.split(".").join(" ") ||
        "N/A",
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

ipcMain.on("run-command", (event, command, pkg) => {
  event.sender.send(
    "installation-status-change",
    { packageName: pkg.packageName, processing: true, installed: false }
  );

  exec(command, async (error, stdout, stderr) => {
    if (!linux) {
      if (error || stderr) {
        if (command.includes("winget uninstall ")) {
          event.sender.send("installation-status-change", {
            packageName: pkg.packageName,
            processing: false,
            installed: true,
          });
        }

        if (command.includes("winget install ")) {
          event.sender.send("installation-status-change", {
            packageName: pkg.packageName,
            processing: false,
            installed: false,
          });
        }
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

      if (command.includes("winget uninstall ")) {
        await removePackage(pkg.packageId);
        event.sender.send(
          "installation-status-change",
          { packageName:pkg.packageName, processing: false, installed: false }
        );
      }

      if (command.includes("winget install ")) {
        await addPackage(pkg.packageId);
        event.sender.send(
          "installation-status-change",
          { packageName:pkg.packageName, processing: false, installed: true }
        );
      }

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
const readCacheFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(CACHE_PATH, "utf8", (err, data) => {
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
    console.log("Erro ao analisar JSON do Cache " + err);
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

const updateCacheData = async () => {
  cacheData = await readCacheFile();

  if (cacheData) {
    console.log("[Cache] data loaded correctly")
    jsonData = parseJson(cacheData);
    packages = getPackages(jsonData);
  }
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
  console.log("Buscando pacotes no cache")

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

// Fila para operações de leitura/escrita no arquivo
let operationQueue = Promise.resolve();

// Função para ler o arquivo JSON atualizado
const readJsonFile = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile(CACHE_PATH, "utf8", (err, data) => {
      if (err) {
        console.error("[Warn] Falha ao ler o cache:", err);
        resolve(false);
      } else {
        try {
          resolve(JSON.parse(data));
        } catch (parseError) {
          console.error("[Error] Erro ao analisar JSON:", parseError);
          resolve(false);
        }
      }
    });
  });
};

// Função para escrever no arquivo JSON, garantindo que não haja concorrência
const writeJsonFile = async (data) => {
  return new Promise((resolve, reject) => {
    operationQueue = operationQueue
      .then(
        () =>
          new Promise((innerResolve, innerReject) => {
            fs.writeFile(
              CACHE_PATH,
              JSON.stringify(data, null, 2),
              "utf8",
              (err) => {
                if (err) {
                  console.error("[Error] Falha ao salvar o cache:", err);
                  innerReject(err);
                } else {
                  innerResolve(true);
                }
              }
            );
          })
      )
      .then(resolve)
      .catch(reject);
  });
};

// Função para adicionar um pacote
const addPackage = async (packageName) => {
  let jsonData = await readJsonFile();
  if (!jsonData || !jsonData.Sources[0]?.Packages) {
    console.error("[Error] Estrutura do cache inválida.");
    return false;
  }

  const packages = jsonData.Sources[0].Packages;

  // Verifica se o pacote já existe
  const existingPackage = packages.find(
    (pkg) => pkg.PackageIdentifier === packageName
  );
  if (existingPackage) {
    console.log(`[Warn] Pacote '${packageName}' já existe no cache.`);
    return false;
  }

  // Adiciona o novo pacote
  packages.push({
    PackageIdentifier: packageName,
    InstalledDate: new Date().toISOString(),
  });

  // Escreve o JSON atualizado no arquivo
  await writeJsonFile(jsonData);
  console.log(`[Info] Pacote '${packageName}' adicionado ao cache.`);

  await updateCacheData();

  return true;
};

// Função para remover um pacote
const removePackage = async (packageName) => {
  let jsonData = await readJsonFile();
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
  await writeJsonFile(jsonData);
  console.log(`[Info] Pacote '${packageName}' removido do cache.`);
  await updateCacheData();
  return true;
};
