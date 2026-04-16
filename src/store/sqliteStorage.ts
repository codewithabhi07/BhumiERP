import { StateStorage } from 'zustand/middleware';

export const sqliteStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const val = await (window as any).electronAPI.storeGet(name);
      return val || null;
    }
    return localStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      await (window as any).electronAPI.storeSet(name, value);
    } else {
      localStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      await (window as any).electronAPI.storeDelete(name);
    } else {
      localStorage.removeItem(name);
    }
  },
};
