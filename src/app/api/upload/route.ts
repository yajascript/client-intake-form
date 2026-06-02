import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  const sessionId = searchParams.get('sessionId');

  if (!filename || !sessionId) {
    return NextResponse.json({ error: 'Filename and sessionId are required' }, { status: 400 });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const blob = await put(`sessions/${sessionId}/${filename}`, request.body as ReadableStream, {
      access: 'private',
      token: token,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Vercel Blob Upload Error:", error);
    return NextResponse.json({ error: 'Failed to upload to Vercel Blob' }, { status: 500 });
  }
}
