import { getRedisClient } from "../connection/redis.connection";
import { TTL, type TTLValue } from "../config/redis.config";

/**
 * Store a value in Redis with optional TTL.
 * Value is JSON-serialized automatically.
 */
export async function setCache<T>(
    key: string,
    value: T,
    ttl: TTLValue = TTL.SHORT
): Promise<void> {
    try {
        const redis = getRedisClient();
        await redis.set(key, JSON.stringify(value), "EX", ttl);
    } catch (err) {
        console.error(`[Cache] Failed to SET key "${key}":`, (err as Error).message);
        // Non-fatal: don't crash the service if cache write fails
    }
}

/**
 * Retrieve a value from Redis by key.
 * Returns null on cache miss or error.
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const redis = getRedisClient();
        const data = await redis.get(key);
        return data ? (JSON.parse(data) as T) : null;
    } catch (err) {
        console.error(`[Cache] Failed to GET key "${key}":`, (err as Error).message);
        return null; // Graceful degradation: fall through to DB
    }
}

/**
 * Delete a key from Redis.
 */
export async function deleteCache(key: string): Promise<void> {
    try {
        const redis = getRedisClient();
        await redis.del(key);
    } catch (err) {
        console.error(`[Cache] Failed to DELETE key "${key}":`, (err as Error).message);
    }
}

/**
 * Delete all keys matching a pattern (e.g. "loan:*").
 * Use with care in production — scans the keyspace.
 */
export async function deleteCacheByPattern(pattern: string): Promise<void> {
    try {
        const redis = getRedisClient();
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`[Cache] Deleted ${keys.length} keys matching "${pattern}"`);
        }
    } catch (err) {
        console.error(`[Cache] Failed to DELETE pattern "${pattern}":`, (err as Error).message);
    }
}

/**
 * Check if a key exists in Redis.
 */
export async function hasCache(key: string): Promise<boolean> {
    try {
        const redis = getRedisClient();
        return (await redis.exists(key)) === 1;
    } catch (err) {
        console.error(`[Cache] Failed to CHECK key "${key}":`, (err as Error).message);
        return false;
    }
}
