const { ipcMain } = require("electron");
const DatabaseManager = require("../db/db");
const { companies } = require("../db/schema/Company");

function registerCompanyDashboardIpc() {
  try {
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getDatabase();
    console.log("Database instance initialized:", !!db);

    // Register the IPC handler to add a company
    ipcMain.handle("add-company", async (event, data) => {
      try {
        console.log("Received add-company request with data:", data);

        const gstin = data.gstApplicable === true ? data.gstin : null;
        const stateCode = data.gstApplicable === true ? data.stateCode : null;

        const result = await db.insert(companies).values({
          companyType: data.companyType || "Manufacturer",
          companyName: data.companyName,
          currency: data.currency || "INR",
          gstApplicable: data.gstApplicable === true ? "Yes" : "No",
          gstin,
          stateCode,
          country: data.country,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          state: data.state,
          city: data.city,
          email: data.email,
          contactNo: data.contactNo,
        });

        return { success: true, result };
      } catch (err) {
        console.error("Insert error:", err);
        return { success: false, error: err.message };
      }
    });
    console.log("IPC handler 'add-company' registered successfully");

    // Register the IPC handler to get all companies
    ipcMain.handle("get-company", async (event) => {
      try {
        console.log("Received get-company request");
        const result = await db.select().from(companies);
        console.log(`Retrieved ${result.length} companies from database`);
        return { success: true, companies: result };
      } catch (err) {
        console.error("Get company error:", err);
        return { success: false, error: err.message };
      }
    });
    console.log("IPC handler 'get-company' registered successfully");
  } catch (err) {
    console.error("Failed to initialize company dashboard IPC:", err);
  }
}

module.exports = { registerCompanyDashboardIpc };
