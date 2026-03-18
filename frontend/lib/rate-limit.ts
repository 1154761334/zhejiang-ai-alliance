import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
};

function getRateLimitKey(identifier: string, action: string): string {
  return `${action}:${identifier}`;
}

export function checkRateLimit(
  identifier: string,
  action: string = 'default',
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(identifier, action);
  const now = Date.now();
  
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitMap.set(key, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }
  
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

export function rateLimitMiddleware(
  req: NextRequest,
  action: string,
  config: RateLimitConfig = defaultConfig
): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  const result = checkRateLimit(ip, action, config);
  
  if (!result.allowed) {
    const response = NextResponse.json(
      { error: '请求过于频繁，请稍后再试' },
      { status: 429 }
    );
    
    response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    
    return response;
  }
  
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
  
  return response;
}

export const authRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
};

export const apiRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 30,
};

export const loginRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
};

export const registerRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
};

setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitMap.entries()).forEach(([key, entry]) => {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  });
}, 60 * 60 * 1000);