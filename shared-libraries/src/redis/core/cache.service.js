"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCache = setCache;
exports.getCache = getCache;
exports.deleteCache = deleteCache;
exports.deleteCacheByPattern = deleteCacheByPattern;
exports.hasCache = hasCache;
const redis_connection_1 = require("../connection/redis.connection");
const redis_config_1 = require("../config/redis.config");
/**
 * Store a value in Redis with optional TTL.
 * Value is JSON-serialized automatically.
 */
async function setCache(key, value, ttl = redis_config_1.TTL.SHORT) {
    try {
        const redis = (0, redis_connection_1.getRedisClient)();
        await redis.set(key, JSON.stringify(value), "EX", ttl);
    }
    catch (err) {
        console.error(`[Cache] Failed to SET key "${key}":`, err.message);
        // Non-fatal: don't crash the service if cache write fails
    }
}
/**
 * Retrieve a value from Redis by key.
 * Returns null on cache miss or error.
 */
async function getCache(key) {
    try {
        const redis = (0, redis_connection_1.getRedisClient)();
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    }
    catch (err) {
        console.error(`[Cache] Failed to GET key "${key}":`, err.message);
        return null; // Graceful degradation: fall through to DB
    }
}
/**
 * Delete a key from Redis.
 */
async function deleteCache(key) {
    try {
        const redis = (0, redis_connection_1.getRedisClient)();
        await redis.del(key);
    }
    catch (err) {
        console.error(`[Cache] Failed to DELETE key "${key}":`, err.message);
    }
}
/**
 * Delete all keys matching a pattern (e.g. "loan:*").
 * Use with care in production — scans the keyspace.
 */
async function deleteCacheByPattern(pattern) {
    try {
        const redis = (0, redis_connection_1.getRedisClient)();
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`[Cache] Deleted ${keys.length} keys matching "${pattern}"`);
        }
    }
    catch (err) {
        console.error(`[Cache] Failed to DELETE pattern "${pattern}":`, err.message);
    }
}
/**
 * Check if a key exists in Redis.
 */
async function hasCache(key) {
    try {
        const redis = (0, redis_connection_1.getRedisClient)();
        return (await redis.exists(key)) === 1;
    }
    catch (err) {
        console.error(`[Cache] Failed to CHECK key "${key}":`, err.message);
        return false;
    }
}
//# sourceMappingURL=cache.service.js.map