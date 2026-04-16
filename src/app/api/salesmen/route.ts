import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.salesmen || []);
  } catch (error: any) {
    console.error('API Error (GET /api/salesmen):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const salesman = await request.json();
    const db = await readDB();
    if (!db.salesmen) db.salesmen = [];
    db.salesmen.push(salesman);
    await writeDB(db);
    return NextResponse.json(salesman);
  } catch (error: any) {
    console.error('API Error (POST /api/salesmen):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedSalesman } = await request.json();
    const db = await readDB();
    db.salesmen = (db.salesmen || []).map((s: any) => s.id === id ? { ...s, ...updatedSalesman } : s);
    await writeDB(db);
    return NextResponse.json({ id, ...updatedSalesman });
  } catch (error: any) {
    console.error('API Error (PUT /api/salesmen):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.salesmen = (db.salesmen || []).filter((s: any) => s.id !== id);
    await writeDB(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error (DELETE /api/salesmen):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
