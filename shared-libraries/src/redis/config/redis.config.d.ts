export declare const REDIS_CONFIG: {
    url: string;
    retryDelay: number;
    maxRetries: number;
};
/** Standard TTL presets (in seconds) */
export declare const TTL: {
    readonly SHORT: 60;
    readonly MEDIUM: 300;
    readonly LONG: 3600;
    readonly DAY: 86400;
};
export type TTLValue = (typeof TTL)[keyof typeof TTL];
//# sourceMappingURL=redis.config.d.ts.map