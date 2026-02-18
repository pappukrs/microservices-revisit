"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = getRedisClient;
exports.disconnectRedis = disconnectRedis;
const ioredis_1 = __importDefault(require("ioredis"));
const redis_config_1 = require("../config/redis.config");
let client = null;
function getRedisClient() {
    if (client)
        return client;
    client = new ioredis_1.default(redis_config_1.REDIS_CONFIG.url, {
        maxRetriesPerRequest: redis_config_1.REDIS_CONFIG.maxRetries,
        retryStrategy(times) {
            if (times > redis_config_1.REDIS_CONFIG.maxRetries) {
                console.error(`[Redis] Max retries (${redis_config_1.REDIS_CONFIG.maxRetries}) reached. Giving up.`);
                return null; // stop retrying
            }
            const delay = redis_config_1.REDIS_CONFIG.retryDelay * times;
            console.warn(`[Redis] Retrying connection in ${delay}ms (attempt ${times})...`);
            return delay;
        },
    });
    client.on("connect", () => console.log("[Redis] Connected successfully"));
    client.on("error", (err) => console.error("[Redis] Connection error:", err.message));
    client.on("close", () => console.warn("[Redis] Connection closed"));
    return client;
}
async function disconnectRedis() {
    if (client) {
        await client.quit();
        client = null;
        console.log("[Redis] Disconnected");
    }
}
//# sourceMappingURL=redis.connection.js.map