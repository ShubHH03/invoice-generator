// src/ipc/customerDashboard.js

const { ipcMain } = require("electron");
const DatabaseManager = require("../db/db");
const { customers } = require("../db/schema/Customer"); 

function registerCustomerDashboardIpc() {
  try {
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getDatabase();
    console.log("Database instance initialized:", !!db);

    ipcMain.handle("add-customer", async (event, data) => {
      try {
        console.log("Received add-customer request with data:", data);

        const gstin = data.gstApplicable === true ? data.gstin : null;
        const stateCode = data.gstApplicable === true ? data.stateCode : null;

        const result = await db.insert(customers).values({
          customerType: data.customerType || "Individual",
          salutation: data.salutation || null,
          firstName: data.firstName,
          lastName: data.lastName,
          panNumber: data.panNumber || null,

          companyName: data.companyName,
          currency: data.currency || "INR",

          gstApplicable: data.gstApplicable === true ? "Yes" : "No",
          gstin,
          stateCode,

          billingCountry: data.billingCountry,
          billingState: data.billingState,
          billingCity: data.billingCity,
          billingAddressLine1: data.billingAddressLine1,
          billingAddressLine2: data.billingAddressLine2 || null,
          billingContactNo: data.billingContactNo,
          billingEmail: data.billingEmail,
          billingAlternateContactNo: data.billingAlternateContactNo || null,

          shippingCountry: data.shippingCountry,
          shippingState: data.shippingState,
          shippingCity: data.shippingCity,
          shippingAddressLine1: data.shippingAddressLine1,
          shippingAddressLine2: data.shippingAddressLine2 || null,
          shippingContactNo: data.shippingContactNo,
          shippingEmail: data.shippingEmail,
          shippingAlternateContactNo: data.shippingAlternateContactNo || null,
        });

        return { success: true, result };
      } catch (err) {
        console.error("Insert error in add-customer:", err);
        return { success: false, error: err.message };
      }
    });

    console.log("IPC handler 'add-customer' registered successfully");
  } catch (err) {
    console.error("Failed to initialize customer dashboard IPC:", err);
  }
}

module.exports = { registerCustomerDashboardIpc };
