const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  invoke: (package) => ipcRenderer.invoke("search-package", package),
  runCommand: (command) => ipcRenderer.send("run-command", command),
});
