import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.leaveRequests || []);
  } catch (error: any) {
    console.error('API Error (GET /api/leaves):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const leave = await request.json();
    const db = await readDB();
    if (!db.leaveRequests) db.leaveRequests = [];
    db.leaveRequests.push(leave);
    await writeDB(db);
    return NextResponse.json(leave);
  } catch (error: any) {
    console.error('API Error (POST /api/leaves):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedLeave } = await request.json();
    const db = await readDB();
    db.leaveRequests = (db.leaveRequests || []).map((l: any) => l.id === id ? { ...l, ...updatedLeave } : l);
    await writeDB(db);
    return NextResponse.json({ id, ...updatedLeave });
  } catch (error: any) {
    console.error('API Error (PUT /api/leaves):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.leaveRequests = (db.leaveRequests || []).filter((l: any) => l.id !== id);
    await writeDB(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error (DELETE /api/leaves):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
