const { ipcMain } = require("electron");
const DatabaseManager = require("../db/db");
const { items } = require("../db/schema/Item");

function registerItemDashboardIpc() {
  try {
    const dbManager = DatabaseManager.getInstance();
    const db = dbManager.getDatabase();
    console.log("Database instance initialized:", !!db);

    // Register the IPC handler
    ipcMain.handle("add-items", async (event, data) => {
      try {
        console.log("Received add-items request with data:", data);
        const result = await db.insert(items).values({
          type: data.itemType || "Goods",
          name: data.name,
          unit: data.unit || null,
          sellingPrice: parseFloat(data.price || 0),
          description: data.description || null,
          currency: "INR", // Fixed for now
        });
        return { success: true, result };
      } catch (err) {
        console.error("Insert error:", err);
        return { success: false, error: err.message };
      }
    });
    console.log("IPC handler 'add-items' registered successfully");
  } catch (err) {
    console.error("Failed to initialize mainDashboardIpc:", err);
  }
}

module.exports = { registerItemDashboardIpc };
