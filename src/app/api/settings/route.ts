import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.settings || {});
  } catch (error: any) {
    console.error('API Error (GET /api/settings):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedSettings = await request.json();
    const db = await readDB();
    db.settings = { ...(db.settings || {}), ...updatedSettings };
    await writeDB(db);
    return NextResponse.json(db.settings);
  } catch (error: any) {
    console.error('API Error (PUT /api/settings):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
