import { NextRequest, NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(identifier: string, action: string): string {
  return `${action}:${identifier}`;
}

function checkRateLimit(
  identifier: string,
  action: string,
  windowMs: number,
  maxRequests: number
): { allowed: boolean; remaining: number } {
  const key = getRateLimitKey(identifier, action);
  const now = Date.now();
  
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

function applyRateLimit(
  req: NextRequest,
  action: string,
  windowMs: number,
  maxRequests: number
): NextResponse | null {
  const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] || 
             req.headers.get('x-real-ip') || 
             'unknown').trim();
  
  const result = checkRateLimit(ip, action, windowMs, maxRequests);
  
  if (!result.allowed) {
    return NextResponse.json(
      { error: '请求过于频繁，请稍后再试', code: 'RATE_LIMIT_EXCEEDED' },
      { status: 429 }
    );
  }
  
  return null;
}

export function middleware(req: NextRequest) {
  if (!isProduction) {
    return NextResponse.next();
  }

  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  if (pathname.startsWith('/api/auth/login')) {
    const rateLimited = applyRateLimit(req, 'login', 15 * 60 * 1000, 5);
    if (rateLimited) return rateLimited;
  }

  if (pathname.startsWith('/api/register')) {
    const rateLimited = applyRateLimit(req, 'register', 60 * 60 * 1000, 3);
    if (rateLimited) return rateLimited;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};