const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  addItems: (data) => ipcRenderer.invoke("add-items", data),
  addCompany: (data) => ipcRenderer.invoke("add-company", data),
  getCompany: () => ipcRenderer.invoke("get-company"),
  getItem: () => ipcRenderer.invoke("get-Item"),
  addCustomer: (data) => ipcRenderer.invoke("add-customer", data),
});
