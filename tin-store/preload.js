const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  searchPackage: (package) => ipcRenderer.invoke("search-package", package),
  runCommand: (command) => ipcRenderer.send("run-command", command),

  onInstallationStatusChange: (callback) => {
    ipcRenderer.on("installation-status-change", (event, message) => {
      callback(event, message);
    });
  },

  removeInstallationListener: (callback) => {
    ipcRenderer.removeListener("installation-status-change", callback);
  },
});
