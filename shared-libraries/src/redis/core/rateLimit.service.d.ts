export interface RateLimitOptions {
    /** Maximum number of requests allowed in the window */
    limit: number;
    /** Window duration in seconds */
    windowSec: number;
    /** Optional key prefix to namespace different limiters (default: "rl") */
    prefix?: string;
}
export interface RateLimitResult {
    /** Whether the request is allowed */
    allowed: boolean;
    /** How many requests remain in the current window */
    remaining: number;
    /** Total limit for the window */
    limit: number;
    /** Unix timestamp (ms) when the window resets */
    resetAt: number;
    /** Seconds until the window resets */
    retryAfter: number;
}
/**
 * Fixed window rate limiter.
 *
 * @param identifier  Unique key per user/IP/route (e.g. "user:42:login")
 * @param options     Limit and window configuration
 *
 * @example
 * const result = await fixedWindowRateLimit("ip:192.168.1.1", { limit: 10, windowSec: 60 });
 * if (!result.allowed) throw new TooManyRequestsError();
 */
export declare function fixedWindowRateLimit(identifier: string, options: RateLimitOptions): Promise<RateLimitResult>;
/**
 * Sliding window rate limiter using a Redis sorted set.
 * More accurate than fixed window — no burst at window boundary.
 *
 * @param identifier  Unique key per user/IP/route
 * @param options     Limit and window configuration
 *
 * @example
 * const result = await slidingWindowRateLimit("user:42:api", { limit: 100, windowSec: 60 });
 */
export declare function slidingWindowRateLimit(identifier: string, options: RateLimitOptions): Promise<RateLimitResult>;
export interface TokenBucketOptions {
    /** Max tokens (burst capacity) */
    capacity: number;
    /** Tokens added per second (refill rate) */
    refillRate: number;
    /** Tokens consumed per request (default: 1) */
    tokensPerRequest?: number;
    /** Optional key prefix */
    prefix?: string;
}
/**
 * Token bucket rate limiter.
 * Allows bursting up to `capacity` then throttles to `refillRate` req/sec.
 *
 * @example
 * const result = await tokenBucketRateLimit("user:42", { capacity: 20, refillRate: 5 });
 */
export declare function tokenBucketRateLimit(identifier: string, options: TokenBucketOptions): Promise<RateLimitResult>;
export type RateLimitStrategy = "fixed" | "sliding" | "token-bucket";
export interface MiddlewareOptions {
    strategy?: RateLimitStrategy;
    /** Extract identifier from request (default: req.ip) */
    keyGenerator?: (req: any) => string;
    /** Custom message on 429 */
    message?: string;
    /** Skip rate limiting for certain requests */
    skip?: (req: any) => boolean;
}
/**
 * Express middleware factory for rate limiting.
 *
 * @example
 * // Fixed window: 100 req/min per IP
 * app.use(createRateLimitMiddleware({ limit: 100, windowSec: 60 }));
 *
 * // Sliding window on a specific route
 * app.post("/login", createRateLimitMiddleware({
 *     limit: 5,
 *     windowSec: 60,
 *     strategy: "sliding",
 *     keyGenerator: (req) => `login:${req.ip}`,
 *     message: "Too many login attempts. Try again in a minute.",
 * }));
 *
 * // Token bucket for API endpoints
 * app.use("/api", createRateLimitMiddleware({
 *     strategy: "token-bucket",
 *     limit: 50,      // capacity
 *     windowSec: 10,  // refillRate = limit/windowSec = 5 req/sec
 * }));
 */
export declare function createRateLimitMiddleware(options: RateLimitOptions & MiddlewareOptions): (req: any, res: any, next: any) => Promise<any>;
/**
 * Check rate limit status without consuming a token.
 * Useful for pre-flight checks or monitoring.
 */
export declare function getRateLimitStatus(identifier: string, options: RateLimitOptions): Promise<{
    count: number;
    remaining: number;
    resetAt: number;
}>;
/**
 * Reset rate limit for a specific identifier.
 * Useful for admin overrides or after successful verification.
 */
export declare function resetRateLimit(identifier: string, prefix?: string): Promise<void>;
//# sourceMappingURL=rateLimit.service.d.ts.map