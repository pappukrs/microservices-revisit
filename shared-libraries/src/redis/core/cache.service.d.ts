import { type TTLValue } from "../config/redis.config";
/**
 * Store a value in Redis with optional TTL.
 * Value is JSON-serialized automatically.
 */
export declare function setCache<T>(key: string, value: T, ttl?: TTLValue): Promise<void>;
/**
 * Retrieve a value from Redis by key.
 * Returns null on cache miss or error.
 */
export declare function getCache<T>(key: string): Promise<T | null>;
/**
 * Delete a key from Redis.
 */
export declare function deleteCache(key: string): Promise<void>;
/**
 * Delete all keys matching a pattern (e.g. "loan:*").
 * Use with care in production — scans the keyspace.
 */
export declare function deleteCacheByPattern(pattern: string): Promise<void>;
/**
 * Check if a key exists in Redis.
 */
export declare function hasCache(key: string): Promise<boolean>;
//# sourceMappingURL=cache.service.d.ts.map