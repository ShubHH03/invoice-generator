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
  checkTallyRunning: (port) => ipcRenderer.invoke("check-tally-running", port),
  importLedgers: (companyName, port) =>
    ipcRenderer.invoke("import-ledgers", companyName, port),
  getTallyTransactions: (caseId) =>
    ipcRenderer.invoke("get-tally-transactions", caseId),
  addInvoice: (invoice) => ipcRenderer.invoke("add-invoice", invoice),
  addInvoiceItems: (invoiceItems) =>
    ipcRenderer.invoke("add-invoice-items", invoiceItems),
  // getInvoiceItems: (invoiceId) =>
  //   ipcRenderer.invoke("get-invoice-items", invoiceId),

  getAllInvoiceItems: (invoiceId) => ipcRenderer.invoke("invoiceItem:getAll", invoiceId),

  getAllInvoices: () => ipcRenderer.invoke("invoice:getAll"),
  getCustomerbyId: (id) => ipcRenderer.invoke("customer:getById", id),
});
