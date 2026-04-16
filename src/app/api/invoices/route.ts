import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.invoices || []);
  } catch (error: any) {
    console.error('API Error (GET /api/invoices):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const invoice = await request.json();
    const db = await readDB();
    if (!db.invoices) db.invoices = [];
    db.invoices.push(invoice);
    await writeDB(db);
    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('API Error (POST /api/invoices):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedInvoice } = await request.json();
    const db = await readDB();
    db.invoices = (db.invoices || []).map((inv: any) => inv.id === id ? { ...inv, ...updatedInvoice } : inv);
    await writeDB(db);
    return NextResponse.json({ id, ...updatedInvoice });
  } catch (error: any) {
    console.error('API Error (PUT /api/invoices):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.invoices = (db.invoices || []).filter((inv: any) => inv.id !== id);
    await writeDB(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error (DELETE /api/invoices):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
