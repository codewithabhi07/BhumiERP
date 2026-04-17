import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    console.log('GET /api/leaves - Started');
    const db = await readDB();
    console.log('GET /api/leaves - Success');
    return NextResponse.json(db.leaveRequests || []);
  } catch (error: any) {
    console.error('GET /api/leaves - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/leaves - Started');
    const leave = await request.json();
    const db = await readDB();
    if (!db.leaveRequests) db.leaveRequests = [];
    db.leaveRequests.push(leave);
    await writeDB(db);
    console.log('POST /api/leaves - Success');
    return NextResponse.json(leave);
  } catch (error: any) {
    console.error('POST /api/leaves - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    console.log('PUT /api/leaves - Started');
    const { id, ...updatedLeave } = await request.json();
    const db = await readDB();
    db.leaveRequests = (db.leaveRequests || []).map((l: any) => l.id === id ? { ...l, ...updatedLeave } : l);
    await writeDB(db);
    console.log('PUT /api/leaves - Success');
    return NextResponse.json({ id, ...updatedLeave });
  } catch (error: any) {
    console.error('PUT /api/leaves - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('DELETE /api/leaves - Started');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.leaveRequests = (db.leaveRequests || []).filter((l: any) => l.id !== id);
    await writeDB(db);
    console.log('DELETE /api/leaves - Success');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/leaves - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
