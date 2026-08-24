export interface RateLimitStore {
  consume(key: string, limit: number, windowMs: number, now: number): Promise<boolean>;
}

export function d1RateLimitStore(db: D1Database): RateLimitStore {
  return {
    async consume(key, limit, windowMs, now) {
      const row = await db
        .prepare("SELECT window_start, count FROM rate_limits WHERE key = ?")
        .bind(key)
        .first<{ window_start: number; count: number }>();

      if (!row || now - row.window_start >= windowMs) {
        await db
          .prepare(
            "INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, count = 1",
          )
          .bind(key, now)
          .run();
        return true;
      }

      if (row.count >= limit) {
        return false;
      }

      await db
        .prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?")
        .bind(key)
        .run();
      return true;
    },
  };
}

export class MemoryRateLimitStore implements RateLimitStore {
  private readonly windows = new Map<string, { windowStart: number; count: number }>();

  async consume(key: string, limit: number, windowMs: number, now: number): Promise<boolean> {
    const current = this.windows.get(key);
    if (!current || now - current.windowStart >= windowMs) {
      this.windows.set(key, { windowStart: now, count: 1 });
      return true;
    }
    if (current.count >= limit) return false;
    current.count += 1;
    return true;
  }
}
