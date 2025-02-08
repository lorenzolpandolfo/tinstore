const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  searchPackage: (package) => ipcRenderer.invoke("search-package", package),
  runCommand: (command) => ipcRenderer.send("run-command", command),
});
