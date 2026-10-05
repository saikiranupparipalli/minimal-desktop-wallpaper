"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const sql_js_1 = __importDefault(require("sql.js"));
let mainWindow = null;
let db = null;
let dbPath = '';
async function initDB() {
    dbPath = path.join(electron_1.app.getPath('userData'), 'wallpapers.sqlite');
    try {
        const SQL = await (0, sql_js_1.default)();
        if (fs.existsSync(dbPath)) {
            const filebuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(filebuffer);
        }
        else {
            db = new SQL.Database();
            db.run(`CREATE TABLE IF NOT EXISTS wallpapers (
        id TEXT PRIMARY KEY,
        name TEXT,
        data TEXT
      )`);
            saveDB();
        }
    }
    catch (err) {
        console.error('Failed to init DB:', err);
    }
}
function saveDB() {
    if (!db)
        return;
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    if (electron_is_dev_1.default) {
        mainWindow.loadURL('http://localhost:5199');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(async () => {
    await initDB();
    createWindow();
    electron_1.ipcMain.on('save-wallpaper', (event, wallpaperDataStr) => {
        if (!db)
            return;
        try {
            const wallpaper = JSON.parse(wallpaperDataStr);
            db.run(`INSERT OR REPLACE INTO wallpapers (id, name, data) VALUES (?, ?, ?)`, [wallpaper.id, wallpaper.name, wallpaperDataStr]);
            saveDB();
            console.log('Saved wallpaper to SQLite DB using sql.js!');
        }
        catch (e) {
            console.error('Error saving wallpaper to db', e);
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
