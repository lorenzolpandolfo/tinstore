import { app, BrowserWindow, Menu, shell } from "electron";
import path from "path";

import "./src/handlers/ipcHandler.js";
import { registerHandlers } from "./src/handlers/ipcHandler.js";

let win;
const iconPath = path.join(app.getAppPath(), "src", "assets", "Logo.png");
const appName = "tinstore";

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

  win.loadURL("http://localhost:5173/");

  // adicionar em alguma versao 1.0.0
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
