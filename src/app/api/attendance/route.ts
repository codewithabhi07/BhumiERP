import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.attendance || []);
  } catch (error: any) {
    console.error('API Error (GET /api/attendance):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const record = await request.json();
    const db = await readDB();
    if (!db.attendance) db.attendance = [];
    const index = db.attendance.findIndex((a: any) => a.employeeId === record.employeeId && a.date === record.date);
    if (index !== -1) {
      db.attendance[index] = record;
    } else {
      db.attendance.push(record);
    }
    await writeDB(db);
    return NextResponse.json(record);
  } catch (error: any) {
    console.error('API Error (POST /api/attendance):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.attendance = (db.attendance || []).filter((a: any) => a.id !== id);
    await writeDB(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error (DELETE /api/attendance):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
