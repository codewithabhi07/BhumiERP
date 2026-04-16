import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.products || []);
  } catch (error: any) {
    console.error('API Error (GET /api/products):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json();
    const db = await readDB();
    if (!db.products) db.products = [];
    db.products.push(product);
    await writeDB(db);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('API Error (POST /api/products):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updatedProduct } = await request.json();
    const db = await readDB();
    db.products = (db.products || []).map((p: any) => p.id === id ? { ...p, ...updatedProduct } : p);
    await writeDB(db);
    return NextResponse.json({ id, ...updatedProduct });
  } catch (error: any) {
    console.error('API Error (PUT /api/products):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.products = (db.products || []).filter((p: any) => p.id !== id);
    await writeDB(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error (DELETE /api/products):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
