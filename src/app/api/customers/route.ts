import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.customers || []);
  } catch (error: any) {
    console.error('API Error (GET /api/customers):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customer = await request.json();
    const db = await readDB();
    if (!db.customers) db.customers = [];
    db.customers.push(customer);
    await writeDB(db);
    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('API Error (POST /api/customers):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedCustomer } = await request.json();
    const db = await readDB();
    db.customers = (db.customers || []).map((c: any) => c.id === id ? { ...c, ...updatedCustomer } : c);
    await writeDB(db);
    return NextResponse.json({ id, ...updatedCustomer });
  } catch (error: any) {
    console.error('API Error (PUT /api/customers):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.customers = (db.customers || []).filter((c: any) => c.id !== id);
    await writeDB(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error (DELETE /api/customers):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
