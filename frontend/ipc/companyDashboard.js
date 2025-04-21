const { ipcMain } = require("electron");
const DatabaseManager = require("../db/db");
const { companies } = require("../db/schema/Company"); // Importing the companies schema

function registerCompanyDashboardIpc() {
  try {
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getDatabase();
    console.log("Database instance initialized:", !!db);

    // Register the IPC handler
    ipcMain.handle("add-company", async (event, data) => {
      try {
        console.log("Received add-company request with data:", data);
        
        // Validate GST applicable and provide default values
        const gstin = data.gstApplicable == true? data.gstin : null;
        const stateCode = data.gstApplicable == true? data.stateCode : null;

        const result = await db.insert(companies).values({
          companyType: data.companyType || "Manufacturer", // Default to 'Services' if not provided
          companyName: data.companyName,
          currency: data.currency || "INR", // Default to INR if currency is not provided
          gstApplicable: data.gstApplicable == true? "Yes" : "No", // Default to 'No' if not provided
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
  } catch (err) {
    console.error("Failed to initialize company dashboard IPC:", err);
  }
}

module.exports = { registerCompanyDashboardIpc };
