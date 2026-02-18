"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixedWindowRateLimit = fixedWindowRateLimit;
exports.slidingWindowRateLimit = slidingWindowRateLimit;
exports.tokenBucketRateLimit = tokenBucketRateLimit;
exports.createRateLimitMiddleware = createRateLimitMiddleware;
exports.getRateLimitStatus = getRateLimitStatus;
exports.resetRateLimit = resetRateLimit;
const redis_connection_1 = require("../connection/redis.connection");
// ─────────────────────────────────────────────────────────────────────────────
// Fixed Window Rate Limiter
// Simple, low overhead. Resets hard at the end of each window.
// ─────────────────────────────────────────────────────────────────────────────
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
async function fixedWindowRateLimit(identifier, options) {
    const { limit, windowSec, prefix = "rl:fixed" } = options;
    const key = `${prefix}:${identifier}`;
    const now = Date.now();
    try {
        const redis = (0, redis_connection_1.getRedisClient)();
        // Atomic increment + set expiry on first request
        const count = await redis.incr(key);
        if (count === 1) {
            await redis.expire(key, windowSec);
        }
        const ttl = await redis.ttl(key);
        const resetAt = now + ttl * 1000;
        const remaining = Math.max(0, limit - count);
        const allowed = count <= limit;
        return { allowed, remaining, limit, resetAt, retryAfter: allowed ? 0 : ttl };
    }
    catch (err) {
        console.error(`[RateLimit] Fixed window error for "${key}":`, err.message);
        // Fail open — allow request if Redis is down
        return { allowed: true, remaining: limit, limit, resetAt: now + windowSec * 1000, retryAfter: 0 };
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Sliding Window Rate Limiter (Log-based)
// More accurate than fixed window. Uses a sorted set of timestamps.
// ─────────────────────────────────────────────────────────────────────────────
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
async function slidingWindowRateLimit(identifier, options) {
    const { limit, windowSec, prefix = "rl:sliding" } = options;
    const key = `${prefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSec * 1000;
    try {
        const redis = (0, redis_connection_1.getRedisClient)();
        // Lua script for atomic sliding window check
        const luaScript = `
            local key = KEYS[1]
            local now = tonumber(ARGV[1])
            local windowStart = tonumber(ARGV[2])
            local limit = tonumber(ARGV[3])
            local windowSec = tonumber(ARGV[4])

            -- Remove expired entries
            redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)

            -- Count current requests in window
            local count = redis.call('ZCARD', key)

            if count < limit then
                -- Add current request
                redis.call('ZADD', key, now, now)
                redis.call('EXPIRE', key, windowSec)
                return {1, limit - count - 1, count + 1}
            else
                return {0, 0, count}
            end
        `;
        const result = (await redis.eval(luaScript, 1, key, now.toString(), windowStart.toString(), limit.toString(), windowSec.toString()));
        const [allowedInt, remaining, count] = result;
        const allowed = allowedInt === 1;
        // Estimate reset: oldest entry in the window + windowSec
        const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
        const oldestTs = oldest.length >= 2 ? Number(oldest[1]) : now;
        const resetAt = oldestTs + windowSec * 1000;
        const retryAfter = allowed ? 0 : Math.ceil((resetAt - now) / 1000);
        return { allowed, remaining, limit, resetAt, retryAfter };
    }
    catch (err) {
        console.error(`[RateLimit] Sliding window error for "${key}":`, err.message);
        return { allowed: true, remaining: limit, limit, resetAt: now + windowSec * 1000, retryAfter: 0 };
    }
}
/**
 * Token bucket rate limiter.
 * Allows bursting up to `capacity` then throttles to `refillRate` req/sec.
 *
 * @example
 * const result = await tokenBucketRateLimit("user:42", { capacity: 20, refillRate: 5 });
 */
async function tokenBucketRateLimit(identifier, options) {
    const { capacity, refillRate, tokensPerRequest = 1, prefix = "rl:bucket" } = options;
    const key = `${prefix}:${identifier}`;
    const now = Date.now();
    try {
        const redis = (0, redis_connection_1.getRedisClient)();
        const luaScript = `
            local key = KEYS[1]
            local now = tonumber(ARGV[1])
            local capacity = tonumber(ARGV[2])
            local refillRate = tonumber(ARGV[3])
            local tokensPerRequest = tonumber(ARGV[4])

            local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
            local tokens = tonumber(bucket[1]) or capacity
            local lastRefill = tonumber(bucket[2]) or now

            -- Refill tokens based on elapsed time
            local elapsed = (now - lastRefill) / 1000
            local newTokens = math.min(capacity, tokens + elapsed * refillRate)

            if newTokens >= tokensPerRequest then
                newTokens = newTokens - tokensPerRequest
                redis.call('HMSET', key, 'tokens', newTokens, 'lastRefill', now)
                redis.call('EXPIRE', key, math.ceil(capacity / refillRate) + 1)
                return {1, math.floor(newTokens)}
            else
                redis.call('HMSET', key, 'tokens', newTokens, 'lastRefill', now)
                redis.call('EXPIRE', key, math.ceil(capacity / refillRate) + 1)
                return {0, math.floor(newTokens)}
            end
        `;
        const result = (await redis.eval(luaScript, 1, key, now.toString(), capacity.toString(), refillRate.toString(), tokensPerRequest.toString()));
        const [allowedInt, remaining] = result;
        const allowed = allowedInt === 1;
        const retryAfter = allowed ? 0 : Math.ceil((tokensPerRequest - remaining) / refillRate);
        const resetAt = now + retryAfter * 1000;
        return { allowed, remaining, limit: capacity, resetAt, retryAfter };
    }
    catch (err) {
        console.error(`[RateLimit] Token bucket error for "${key}":`, err.message);
        return { allowed: true, remaining: capacity, limit: capacity, resetAt: now, retryAfter: 0 };
    }
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
function createRateLimitMiddleware(options) {
    const { strategy = "sliding", keyGenerator = (req) => req.ip ?? "unknown", message = "Too many requests. Please try again later.", skip, ...rateLimitOptions } = options;
    return async (req, res, next) => {
        try {
            if (skip?.(req))
                return next();
            const identifier = keyGenerator(req);
            let result;
            if (strategy === "fixed") {
                result = await fixedWindowRateLimit(identifier, rateLimitOptions);
            }
            else if (strategy === "token-bucket") {
                result = await tokenBucketRateLimit(identifier, {
                    capacity: rateLimitOptions.limit,
                    refillRate: rateLimitOptions.limit / rateLimitOptions.windowSec,
                    ...(rateLimitOptions.prefix !== undefined && { prefix: rateLimitOptions.prefix }),
                });
            }
            else {
                result = await slidingWindowRateLimit(identifier, rateLimitOptions);
            }
            // Set standard rate limit headers
            res.setHeader("X-RateLimit-Limit", result.limit);
            res.setHeader("X-RateLimit-Remaining", result.remaining);
            res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000));
            if (!result.allowed) {
                res.setHeader("Retry-After", result.retryAfter);
                return res.status(429).json({
                    error: "Too Many Requests",
                    message,
                    retryAfter: result.retryAfter,
                });
            }
            next();
        }
        catch (err) {
            console.error("[RateLimit] Middleware error:", err.message);
            next(); // Fail open
        }
    };
}
// ─────────────────────────────────────────────────────────────────────────────
// Utility: Manual check without blocking (for custom logic)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Check rate limit status without consuming a token.
 * Useful for pre-flight checks or monitoring.
 */
async function getRateLimitStatus(identifier, options) {
    const { limit, windowSec, prefix = "rl:sliding" } = options;
    const key = `${prefix}:${identifier}`;
    const now = Date.now();
    try {
        const redis = (0, redis_connection_1.getRedisClient)();
        const windowStart = now - windowSec * 1000;
        await redis.zremrangebyscore(key, "-inf", windowStart);
        const count = await redis.zcard(key);
        const ttl = await redis.ttl(key);
        return {
            count,
            remaining: Math.max(0, limit - count),
            resetAt: ttl > 0 ? now + ttl * 1000 : now + windowSec * 1000,
        };
    }
    catch (err) {
        console.error(`[RateLimit] Status check error for "${key}":`, err.message);
        return { count: 0, remaining: limit, resetAt: now + windowSec * 1000 };
    }
}
/**
 * Reset rate limit for a specific identifier.
 * Useful for admin overrides or after successful verification.
 */
async function resetRateLimit(identifier, prefix = "rl:sliding") {
    const key = `${prefix}:${identifier}`;
    try {
        const redis = (0, redis_connection_1.getRedisClient)();
        await redis.del(key);
        console.log(`[RateLimit] Reset limit for "${key}"`);
    }
    catch (err) {
        console.error(`[RateLimit] Reset error for "${key}":`, err.message);
    }
}
//# sourceMappingURL=rateLimit.service.js.map