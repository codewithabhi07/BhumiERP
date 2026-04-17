import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    console.log('GET /api/employees - Started');
    const db = await readDB();
    console.log('GET /api/employees - Success');
    return NextResponse.json(db.employees || []);
  } catch (error: any) {
    console.error('GET /api/employees - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/employees - Started');
    const employee = await request.json();
    const db = await readDB();
    if (!db.employees) db.employees = [];
    db.employees.push(employee);
    await writeDB(db);
    console.log('POST /api/employees - Success');
    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('POST /api/employees - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    console.log('PUT /api/employees - Started');
    const { id, ...updatedEmployee } = await request.json();
    const db = await readDB();
    db.employees = (db.employees || []).map((e: any) => e.id === id ? { ...e, ...updatedEmployee } : e);
    await writeDB(db);
    console.log('PUT /api/employees - Success');
    return NextResponse.json({ id, ...updatedEmployee });
  } catch (error: any) {
    console.error('PUT /api/employees - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('DELETE /api/employees - Started');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.employees = (db.employees || []).filter((e: any) => e.id !== id);
    await writeDB(db);
    console.log('DELETE /api/employees - Success');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/employees - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
