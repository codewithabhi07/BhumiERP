import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    console.log('GET /api/customers - Started');
    const db = await readDB();
    console.log('GET /api/customers - Success');
    return NextResponse.json(db.customers || []);
  } catch (error: any) {
    console.error('GET /api/customers - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/customers - Started');
    const customer = await request.json();
    const db = await readDB();
    if (!db.customers) db.customers = [];
    db.customers.push(customer);
    await writeDB(db);
    console.log('POST /api/customers - Success');
    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('POST /api/customers - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    console.log('PUT /api/customers - Started');
    const { id, ...updatedCustomer } = await request.json();
    const db = await readDB();
    db.customers = (db.customers || []).map((c: any) => c.id === id ? { ...c, ...updatedCustomer } : c);
    await writeDB(db);
    console.log('PUT /api/customers - Success');
    return NextResponse.json({ id, ...updatedCustomer });
  } catch (error: any) {
    console.error('PUT /api/customers - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('DELETE /api/customers - Started');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.customers = (db.customers || []).filter((c: any) => c.id !== id);
    await writeDB(db);
    console.log('DELETE /api/customers - Success');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/customers - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
