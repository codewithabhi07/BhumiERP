import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export async function readDB() {
  const data = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(data);
}

export async function writeDB(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
}
