import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require2 = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = require2("better-sqlite3")("dev.db");
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.webContents.openDevTools();
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
ipcMain.handle("create-course", async (_event, courseName) => {
  const result = db.prepare("INSERT INTO course (name) VALUES (?)").run(courseName);
  return result;
});
ipcMain.handle("read-courses", async () => {
  const result = db.prepare("SELECT * FROM course").all();
  return result;
});
ipcMain.handle("read-course", async (_event, courseId) => {
  const result = db.prepare("SELECT * FROM course WHERE id = ?").all(courseId);
  return result;
});
ipcMain.handle("update-course", async (_event, courseId, courseName) => {
  const result = db.prepare("UPDATE course SET name = ? WHERE id = ?").run(courseName, courseId);
  return result;
});
ipcMain.handle("delete-course", async (_event, courseId) => {
  const result = db.prepare("DELETE FROM course WHERE id = ?").run(courseId);
  return result;
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
