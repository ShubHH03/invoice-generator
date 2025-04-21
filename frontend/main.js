const { app, BrowserWindow, protocol, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const { registerItemDashboardIpc } = require("./ipc/itemDashboard");
const {registerCompanyDashboardIpc} = require("./ipc/companyDashboard");
const { registerCustomerDashboardIpc } = require("./ipc/customerDashboard");
// Create logs directory
const logDir = path.join(app.getPath("userData"), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create log file stream
const logStream = fs.createWriteStream(path.join(logDir, "main.log"), {
  flags: "a",
});

// Redirect console.log to file
const originalConsoleLog = console.log;
console.log = function (...args) {
  originalConsoleLog(...args);
  logStream.write(`[${new Date().toISOString()}] ${args.join(" ")}\n`);
};

// Redirect console.error to file
const originalConsoleError = console.error;
console.error = function (...args) {
  originalConsoleError(...args);
  logStream.write(`[${new Date().toISOString()}] ERROR: ${args.join(" ")}\n`);
};

let mainWindow = null;

const isDev = process.env.NODE_ENV === "development";
console.log("process.env.NODE_ENV", process.env.NODE_ENV);

function createProtocol() {
  protocol.registerFileProtocol("app", (request, callback) => {
    const url = request.url.replace("app://", "");
    try {
      return callback(path.normalize(`${__dirname}/../react-app/build/${url}`));
    } catch (error) {
      console.error("Protocol error:", error);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1000,
    simpleFullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "./assets/cyphersol-icon.png"),
    autoHideMenuBar: true,
    title: "CypherSol",
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    const prodPath = path.resolve(
      __dirname,
      "..",
      "react-app",
      "build",
      "index.html"
    );
    console.log("Production path:", prodPath);
    mainWindow.loadFile(prodPath).catch((err) => {
      console.error("Failed to load production build:", err);
    });
  }

  if (isDev) {
    // mainWindow.webContents.openDevTools();
  }

  console.log("Registering IPC handlers...");
  registerItemDashboardIpc();
  registerCompanyDashboardIpc();
  registerCustomerDashboardIpc();
  console.log("IPC handlers registered");
}

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

app.whenReady().then(() => {
  createProtocol();
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
