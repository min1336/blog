import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = `/api/${path.join('/')}`;
  const url = new URL(targetPath, BACKEND_URL);

  const searchParams = req.nextUrl.searchParams.toString();
  if (searchParams) url.search = searchParams;

  const contentType = req.headers.get('content-type') || 'application/json';
  const isMultipart = contentType.includes('multipart/form-data');

  const headers: HeadersInit = {};
  if (!isMultipart) headers['Content-Type'] = contentType;

  const cookie = req.headers.get('cookie');
  if (cookie) headers['cookie'] = cookie;

  let body: BodyInit | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = isMultipart ? await req.arrayBuffer() : await req.text();
    if (isMultipart) headers['Content-Type'] = contentType;
  }

  const backendRes = await fetch(url.toString(), {
    method: req.method,
    headers,
    body,
  });

  const data = await backendRes.text();
  const res = new NextResponse(data, {
    status: backendRes.status,
    headers: { 'Content-Type': backendRes.headers.get('content-type') || 'application/json' },
  });

  const setCookie = backendRes.headers.getSetCookie();
  for (const c of setCookie) {
    res.headers.append('set-cookie', c);
  }

  // 로그아웃 시 브라우저 쿠키 직접 클리어
  if (targetPath === '/api/auth/logout') {
    res.headers.append('set-cookie', 'access_token=; Path=/; Max-Age=0; HttpOnly');
  }

  return res;
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
