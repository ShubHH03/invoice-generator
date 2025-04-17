const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  addItems: (data) => ipcRenderer.invoke("add-items", data),
});
