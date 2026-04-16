import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { storeGet, storeSet, storeDelete, createBill, getTodaySales, getMonthlySales } from './database';

const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'out', 'index.html'));
  }
}

app.whenReady().then(() => {
  
  // Zustand Store IPC Handlers
  ipcMain.handle('store-get', (event, key) => {
    return storeGet(key);
  });
  
  ipcMain.handle('store-set', (event, key, value) => {
    storeSet(key, value);
    return true;
  });
  
  ipcMain.handle('store-delete', (event, key) => {
    storeDelete(key);
    return true;
  });

  // Dedicated Analytics / Action Handlers
  ipcMain.handle('create-bill', (event, billData) => {
    try {
      createBill(billData);
      return { success: true };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-today-sales', () => {
    return getTodaySales();
  });

  ipcMain.handle('get-monthly-sales', () => {
    return getMonthlySales();
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
