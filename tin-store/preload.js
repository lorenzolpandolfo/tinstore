const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  searchPackage: (package) => ipcRenderer.invoke("search-package", package),

  runCommand: (command, pkg) => ipcRenderer.send("run-command", command, pkg),

  onProcessingStatusChange: (callback) => {
    ipcRenderer.on("installation-status-change", (event, status) => {
      callback(event, status);
    });
  },

  generateCacheClientListenerAndProcess: (callback) => {
    ipcRenderer.on("cache-generate-modal", (event, status) => {
      callback(event, status);
    });

    ipcRenderer.send("cache-generate-process");
  },

  generateCacheProcess: () => {
    ipcRenderer.send("cache-generate-process");
  },

  regenerateCache: () => {
    ipcRenderer.send("cache-regenerate");
  },

  checkPackagesInCache: (packages) =>
    ipcRenderer.invoke("check-packages-in-cache", packages),

  getPackagesInCache: () => ipcRenderer.invoke("get-packages-in-cache"),

  changeToken: (token) => ipcRenderer.invoke("change-token", token),

  getToken: (token) => ipcRenderer.invoke("get-token", token),
});
