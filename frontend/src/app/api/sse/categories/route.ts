import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET() {
  const backendRes = await fetch(`${BACKEND_URL}/api/categories/events`, {
    headers: { Accept: 'text/event-stream' },
  });

  if (!backendRes.body) {
    return NextResponse.json({ error: 'SSE not available' }, { status: 502 });
  }

  return new Response(backendRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
