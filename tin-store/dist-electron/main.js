import { app, BrowserWindow, Menu, shell } from "electron";
import path from "path";

import "../src/handlers/ipcHandler.js";
import { registerHandlers } from "../src/handlers/ipcHandler.js";

let win;
const iconPath = path.join(app.getAppPath(), "src", "assets", "Logo.png");
const appName = "Tinstore";
const isDev = !app.isPackaged;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: iconPath,
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173/");
  } else {
    win.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
  }

  Menu.setApplicationMenu(null);

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
};

app.whenReady().then(() => {
  app.setName(appName);
  createWindow();
  registerHandlers(win);
});
