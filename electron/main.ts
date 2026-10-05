import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import isDev from 'electron-is-dev';
import initSqlJs from 'sql.js';

let mainWindow: BrowserWindow | null = null;
let db: any = null;
let dbPath = '';

async function initDB() {
  dbPath = path.join(app.getPath('userData'), 'wallpapers.sqlite');
  try {
    const SQL = await initSqlJs();
    if (fs.existsSync(dbPath)) {
      const filebuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(filebuffer);
    } else {
      db = new SQL.Database();
      db.run(`CREATE TABLE IF NOT EXISTS wallpapers (
        id TEXT PRIMARY KEY,
        name TEXT,
        data TEXT
      )`);
      saveDB();
    }
  } catch (err) {
    console.error('Failed to init DB:', err);
  }
}

function saveDB() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5199');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await initDB();
  createWindow();
  
  ipcMain.on('save-wallpaper', (event, wallpaperDataStr) => {
    if (!db) return;
    try {
      const wallpaper = JSON.parse(wallpaperDataStr);
      db.run(
        `INSERT OR REPLACE INTO wallpapers (id, name, data) VALUES (?, ?, ?)`,
        [wallpaper.id, wallpaper.name, wallpaperDataStr]
      );
      saveDB();
      console.log('Saved wallpaper to SQLite DB using sql.js!');
    } catch (e) {
      console.error('Error saving wallpaper to db', e);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
