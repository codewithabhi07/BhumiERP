import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('GET /api/hello - Started');
    return NextResponse.json({ message: "Hello from the shop-app API!" });
  } catch (error: any) {
    console.error('GET /api/hello - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
