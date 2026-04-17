import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');
const tmpPath = path.join(process.cwd(), 'src/data/db.tmp.json');

// Simple lock to prevent concurrent writes
let isWriting = false;

export async function readDB() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {
        products: [],
        customers: [],
        employees: [],
        attendance: [],
        leaveRequests: [],
        salaryPayments: [],
        invoices: [],
        salesmen: [],
        settings: {}
      };
    }
    console.error('DATABASE READ ERROR:', error);
    throw new Error(`DB Read Error: ${error.message}`);
  }
}

export async function writeDB(data: any) {
  // Wait if another write is in progress
  while (isWriting) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  isWriting = true;
  try {
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(tmpPath, json, 'utf8');
    await fs.rename(tmpPath, dbPath);
  } catch (error: any) {
    console.error('DATABASE WRITE ERROR:', error);
    throw new Error(`DB Write Error: ${error.message}`);
  } finally {
    isWriting = false;
  }
}
