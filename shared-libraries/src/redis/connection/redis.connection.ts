import Redis from "ioredis";
import { REDIS_CONFIG } from "../config/redis.config";

let client: Redis | null = null;

export function getRedisClient(): Redis {
    if (client) return client;

    client = new Redis(REDIS_CONFIG.url, {
        maxRetriesPerRequest: REDIS_CONFIG.maxRetries,
        retryStrategy(times) {
            if (times > REDIS_CONFIG.maxRetries) {
                console.error(`[Redis] Max retries (${REDIS_CONFIG.maxRetries}) reached. Giving up.`);
                return null; // stop retrying
            }
            const delay = REDIS_CONFIG.retryDelay * times;
            console.warn(`[Redis] Retrying connection in ${delay}ms (attempt ${times})...`);
            return delay;
        },
    });

    client.on("connect", () => console.log("[Redis] Connected successfully"));
    client.on("error", (err) => console.error("[Redis] Connection error:", err.message));
    client.on("close", () => console.warn("[Redis] Connection closed"));

    return client;
}

export async function disconnectRedis(): Promise<void> {
    if (client) {
        await client.quit();
        client = null;
        console.log("[Redis] Disconnected");
    }
}
