const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  addItems: (data) => ipcRenderer.invoke("add-items", data),
  addCompany: (data) => ipcRenderer.invoke("add-company", data),
  getCompany: () => ipcRenderer.invoke("get-company"),
  getCompanyImage: (imagePath) =>
    ipcRenderer.invoke("get-company-image", imagePath),
  getItem: () => ipcRenderer.invoke("get-Item"),
  addCustomer: (data) => ipcRenderer.invoke("add-customer", data),
  getCustomer: () => ipcRenderer.invoke("get-customer"),
  addInvoice: (invoice) => ipcRenderer.invoke("add-invoice", invoice),
  addInvoiceItems: (invoiceItems) =>
    ipcRenderer.invoke("add-invoice-items", invoiceItems),
  getAllInvoices: () => ipcRenderer.invoke("invoice:getAll"),
  getInvoiceById: (id) => ipcRenderer.invoke("invoice:getById", id),
  getCustomerbyId: (id) => ipcRenderer.invoke("customer:getById", id),
});
