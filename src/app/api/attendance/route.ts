import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    console.log('GET /api/attendance - Started');
    const db = await readDB();
    console.log('GET /api/attendance - Success');
    return NextResponse.json(db.attendance || []);
  } catch (error: any) {
    console.error('GET /api/attendance - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/attendance - Started');
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
    console.log('POST /api/attendance - Success');
    return NextResponse.json(record);
  } catch (error: any) {
    console.error('POST /api/attendance - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('DELETE /api/attendance - Started');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.attendance = (db.attendance || []).filter((a: any) => a.id !== id);
    await writeDB(db);
    console.log('DELETE /api/attendance - Success');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/attendance - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
