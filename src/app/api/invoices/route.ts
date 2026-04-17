import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    console.log('GET /api/invoices - Started');
    const db = await readDB();
    console.log('GET /api/invoices - Success');
    return NextResponse.json(db.invoices || []);
  } catch (error: any) {
    console.error('GET /api/invoices - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/invoices - Started');
    const invoice = await request.json();
    const db = await readDB();
    if (!db.invoices) db.invoices = [];
    db.invoices.push(invoice);
    await writeDB(db);
    console.log('POST /api/invoices - Success');
    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('POST /api/invoices - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    console.log('PUT /api/invoices - Started');
    const { id, ...updatedInvoice } = await request.json();
    const db = await readDB();
    db.invoices = (db.invoices || []).map((inv: any) => inv.id === id ? { ...inv, ...updatedInvoice } : inv);
    await writeDB(db);
    console.log('PUT /api/invoices - Success');
    return NextResponse.json({ id, ...updatedInvoice });
  } catch (error: any) {
    console.error('PUT /api/invoices - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('DELETE /api/invoices - Started');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.invoices = (db.invoices || []).filter((inv: any) => inv.id !== id);
    await writeDB(db);
    console.log('DELETE /api/invoices - Success');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/invoices - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
