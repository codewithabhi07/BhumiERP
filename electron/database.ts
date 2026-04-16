import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

const isDev = !app.isPackaged;

const dbDir = isDev 
  ? path.join(__dirname, '..', '..') 
  : app.getPath('userData');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'bhumika_garments.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// 1. Generic Key-Value Store for Zustand Persistence
db.exec(`
  CREATE TABLE IF NOT EXISTS store (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

export const storeGet = (key: string) => {
  const stmt = db.prepare('SELECT value FROM store WHERE key = ?');
  const result = stmt.get(key) as { value: string } | undefined;
  return result ? result.value : null;
};

export const storeSet = (key: string, value: string) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)');
  stmt.run(key, value);
};

export const storeDelete = (key: string) => {
  const stmt = db.prepare('DELETE FROM store WHERE key = ?');
  stmt.run(key);
};

// 2. Specific Tables requested for offline robust analytics
db.exec(`
  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    invoiceNumber TEXT,
    customerName TEXT,
    customerPhone TEXT,
    subTotal REAL,
    tax REAL,
    discount REAL,
    rounding REAL,
    totalAmount REAL,
    paymentMethod TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS bill_items (
    id TEXT PRIMARY KEY,
    billId TEXT,
    productId TEXT,
    name TEXT,
    price REAL,
    quantity INTEGER,
    total REAL,
    FOREIGN KEY(billId) REFERENCES bills(id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    address TEXT,
    totalVisits INTEGER,
    totalSpent REAL,
    lastVisit TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    barcode TEXT,
    quantity INTEGER,
    purchasePrice REAL,
    sellingPrice REAL
  );
`);

// Specific APIs for the IPC layer
export const createBill = (bill: any) => {
  const insertBill = db.prepare(`
    INSERT INTO bills (id, invoiceNumber, customerName, customerPhone, subTotal, tax, discount, rounding, totalAmount, paymentMethod, date)
    VALUES (@id, @invoiceNumber, @customerName, @customerPhone, @subTotal, @tax, @discount, @rounding, @totalAmount, @paymentMethod, @date)
  `);

  const insertItem = db.prepare(`
    INSERT INTO bill_items (id, billId, productId, name, price, quantity, total)
    VALUES (@id, @billId, @productId, @name, @price, @quantity, @total)
  `);

  const updateCustomer = db.prepare(`
    INSERT INTO customers (id, name, phone, totalVisits, totalSpent, lastVisit)
    VALUES (@phone, @name, @phone, 1, @totalAmount, @date)
    ON CONFLICT(id) DO UPDATE SET 
      totalVisits = totalVisits + 1,
      totalSpent = totalSpent + @totalAmount,
      lastVisit = @date
  `);

  const updateStock = db.prepare(`
    UPDATE products SET quantity = quantity - @quantity WHERE id = @productId
  `);

  const transaction = db.transaction((b: any) => {
    insertBill.run(b);
    for (const item of b.items) {
      insertItem.run({
        id: Math.random().toString(36).substr(2, 9),
        billId: b.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.total
      });
      if (!item.productId.startsWith('manual-')) {
         updateStock.run({ quantity: item.quantity, productId: item.productId });
      }
    }
    if (b.customerPhone) {
      updateCustomer.run({ phone: b.customerPhone, name: b.customerName, totalAmount: b.totalAmount, date: b.date });
    }
  });

  transaction(bill);
};

export const getTodaySales = () => {
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const todayStartStr = todayStart.toISOString();

  const stmt = db.prepare('SELECT SUM(totalAmount) as total, COUNT(id) as count FROM bills WHERE date >= ?');
  return stmt.get(todayStartStr);
};

export const getMonthlySales = () => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartStr = monthStart.toISOString();

  const stmt = db.prepare('SELECT SUM(totalAmount) as total, COUNT(id) as count FROM bills WHERE date >= ?');
  return stmt.get(monthStartStr);
};

export default db;
