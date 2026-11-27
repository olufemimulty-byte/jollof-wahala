// Jollof Wahala for Windows.
// The window shows the live game from GitHub Pages, so every new puzzle or feature published there
// reaches the app on its next launch (or via the in-game "Update now" notice) without reinstalling.
// With no internet, it falls back to the copy cached by the site, then to the copy bundled in the app.
const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

const SITE = "https://olufemimulty-byte.github.io/jollof-wahala/";
const OFFLINE = path.join(__dirname, "offline", "index.html");

if (!app.requestSingleInstanceLock()) app.quit();

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1180,
    height: 840,
    minWidth: 380,
    minHeight: 600,
    title: "Jollof Wahala",
    backgroundColor: "#111733",
    icon: path.join(__dirname, "icon.ico"),
    autoHideMenuBar: true,
    show: false,
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  win.once("ready-to-show", () => win.show());

  // Links that leave the game open in the normal browser
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith(SITE) && !url.startsWith("file:")) { e.preventDefault(); shell.openExternal(url); }
  });

  win.webContents.on("did-fail-load", (e, code, desc, url, isMainFrame) => {
    if (isMainFrame && !url.startsWith("file:")) win.loadFile(OFFLINE);
  });
  win.loadURL(SITE).catch(() => {});
}

app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
