const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  searchPackage: (package) => ipcRenderer.invoke("search-package", package),
  runCommand: (command, packageName) => ipcRenderer.send("run-command", command, packageName),

  onInstallationStatusChange: (callback) => {
    ipcRenderer.on("installation-status-change", (event, message, packageName) => {
      callback(event, message, packageName);
    });
  },

  removeInstallationListener: (callback) => {
    ipcRenderer.removeListener("installation-status-change", callback);
  },
});
