const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  searchPackage: (package) => ipcRenderer.invoke("search-package", package),

  runCommand: (command, packageName) =>
    ipcRenderer.send("run-command", command, packageName),

  onInstallationStatusChange: (callback) => {
    ipcRenderer.on(
      "installation-status-change",
      (event, message, packageName) => {
        callback(event, message, packageName);
      }
    );
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

  removeInstallationListener: (callback) => {
    ipcRenderer.removeListener("installation-status-change", callback);
  },

  checkPackagesInCache: (packages) => ipcRenderer.invoke("check-packages-in-cache", packages),

});
