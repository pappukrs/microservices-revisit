"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTL = exports.REDIS_CONFIG = void 0;
exports.REDIS_CONFIG = {
    url: process.env["REDIS_URL"] ?? "redis://redis:6379",
    retryDelay: 2000,
    maxRetries: 5,
};
/** Standard TTL presets (in seconds) */
exports.TTL = {
    SHORT: 60, // 1 minute  – volatile data (e.g. OTP, rate-limit counters)
    MEDIUM: 300, // 5 minutes – frequently-read data (e.g. loan details)
    LONG: 3600, // 1 hour    – semi-static data (e.g. user profile)
    DAY: 86400, // 24 hours  – reference data (e.g. config, plans)
};
//# sourceMappingURL=redis.config.js.map