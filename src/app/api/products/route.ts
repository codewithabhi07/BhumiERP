import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/utils/db';

export async function GET() {
  try {
    console.log('GET /api/products - Started');
    const db = await readDB();
    console.log('GET /api/products - Success');
    return NextResponse.json(db.products || []);
  } catch (error: any) {
    console.error('GET /api/products - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/products - Started');
    const product = await request.json();
    const db = await readDB();
    if (!db.products) db.products = [];
    db.products.push(product);
    await writeDB(db);
    console.log('POST /api/products - Success');
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('POST /api/products - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    console.log('PUT /api/products - Started');
    const { id, ...updatedProduct } = await request.json();
    const db = await readDB();
    db.products = (db.products || []).map((p: any) => p.id === id ? { ...p, ...updatedProduct } : p);
    await writeDB(db);
    console.log('PUT /api/products - Success');
    return NextResponse.json({ id, ...updatedProduct });
  } catch (error: any) {
    console.error('PUT /api/products - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('DELETE /api/products - Started');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = await readDB();
    db.products = (db.products || []).filter((p: any) => p.id !== id);
    await writeDB(db);
    console.log('DELETE /api/products - Success');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/products - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
