import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.salaryPayments || []);
  } catch (error: any) {
    console.error('API Error (GET /api/salaries):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payment = await request.json();
    const db = await readDB();
    if (!db.salaryPayments) db.salaryPayments = [];
    db.salaryPayments.push(payment);
    await writeDB(db);
    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('API Error (POST /api/salaries):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.salaryPayments = (db.salaryPayments || []).filter((p: any) => p.id !== id);
    await writeDB(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error (DELETE /api/salaries):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
