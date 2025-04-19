const { ipcMain } = require("electron");
const DatabaseManager = require("../db/db");
const { company } = require("../db/schema/Company");

function registerCompanyDashboardIpc() {
  try {
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getDatabase();
    console.log("Database instance initialized:", !!db);

    // Register the add-company IPC handler
    ipcMain.handle("add-company", async (event, data) => {
      try {
        console.log("Received add-company request with data:", data);
        const result = await db.insert(company).values({
          companyType: data.companyType,
          companyName: data.companyName,
          currency: data.currency,
          logoPath: data.logoPath,
          gstApplicable: data.gstApplicable,
          country: data.country,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          state: data.state,
          city: data.city,
          email: data.email,
          contactNumber: data.contactNumber,
        });
        return { success: true, result };
      } catch (err) {
        console.error("Insert error:", err);
        return { success: false, error: err.message };
      }
    });
    console.log("IPC handler 'add-company' registered successfully");

    // Register the get-company IPC handler
    ipcMain.handle("get-company", async (event) => {
      try {
        console.log("Received get-company request");
        const companies = await db.select().from(company);
        console.log(`Retrieved ${companies.length} companies from database`);
        return { success: true, companies };
      } catch (err) {
        console.error("Get company error:", err);
        return { success: false, error: err.message };
      }
    });
    console.log("IPC handler 'get-company' registered successfully");
  } catch (err) {
    console.error("Failed to initialize companyDashboardIpc:", err);
  }
}

module.exports = { registerCompanyDashboardIpc };
