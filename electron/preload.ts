import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Key-Value Store for Zustand
  storeGet: (key: string) => ipcRenderer.invoke('store-get', key),
  storeSet: (key: string, value: string) => ipcRenderer.invoke('store-set', key, value),
  storeDelete: (key: string) => ipcRenderer.invoke('store-delete', key),
  
  // Custom APIs for offline reporting / analytics
  createBill: (billData: any) => ipcRenderer.invoke('create-bill', billData),
  getTodaySales: () => ipcRenderer.invoke('get-today-sales'),
  getMonthlySales: () => ipcRenderer.invoke('get-monthly-sales'),
});
