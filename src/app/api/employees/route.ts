import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.employees || []);
  } catch (error: any) {
    console.error('API Error (GET /api/employees):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const employee = await request.json();
    const db = await readDB();
    if (!db.employees) db.employees = [];
    db.employees.push(employee);
    await writeDB(db);
    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('API Error (POST /api/employees):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedEmployee } = await request.json();
    const db = await readDB();
    db.employees = (db.employees || []).map((e: any) => e.id === id ? { ...e, ...updatedEmployee } : e);
    await writeDB(db);
    return NextResponse.json({ id, ...updatedEmployee });
  } catch (error: any) {
    console.error('API Error (PUT /api/employees):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.employees = (db.employees || []).filter((e: any) => e.id !== id);
    await writeDB(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error (DELETE /api/employees):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
