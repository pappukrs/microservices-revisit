import { getCache, setCache } from "./cache.service";
import { TTL } from "../config/redis.config";

export async function getLoanDetails(loanId: string) {
    const cacheKey = `loan:${loanId}`;
    const cached = await getCache<{ id: string; amount: number }>(cacheKey);

    if (cached) {
        console.log("[LoanService] Cache hit for", cacheKey);
        return cached;
    }

    console.log("[LoanService] Cache miss — fetching from database");
    // TODO: replace with real DB call
    const loan = { id: loanId, amount: 50000 };

    await setCache(cacheKey, loan, TTL.MEDIUM);

    return loan;
}
