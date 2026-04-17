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

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    if (action === 'reset') {
      const db = await readDB();
      // Clear all arrays but keep settings
      const resetDB = {
        products: [],
        customers: [],
        employees: [],
        attendance: [],
        leaveRequests: [],
        salaryPayments: [],
        salesmen: [],
        invoices: [],
        settings: db.settings || {}
      };
      await writeDB(resetDB);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API Error (POST /api/settings):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
