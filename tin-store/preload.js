const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  invoke: (package) => ipcRenderer.invoke("search-package", package),
});
