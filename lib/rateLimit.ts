// Simple in-memory rate limiter
// For production, consider using Redis or a service like Upstash

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

type RequestRecord = {
  count: number;
  resetTime: number;
};

const requestStore = new Map<string, RequestRecord>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestStore.entries()) {
    if (now > record.resetTime) {
      requestStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export function rateLimit(config: RateLimitConfig) {
  return (identifier: string): { allowed: boolean; remaining: number; resetAt: number } => {
    const now = Date.now();
    const record = requestStore.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new record
      const resetTime = now + config.windowMs;
      requestStore.set(identifier, {
        count: 1,
        resetTime,
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: resetTime,
      };
    }

    // Increment count
    record.count += 1;

    if (record.count > config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetTime,
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetAt: record.resetTime,
    };
  };
}

export function getClientIdentifier(req: { headers: Headers }): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0]?.trim() || realIp || cfConnectingIp || 'unknown';
  return ip;
}
