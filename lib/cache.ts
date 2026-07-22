// Simple in-memory cache scoped to a single warm serverless instance.
// Good enough to stop every page load from re-hitting Sanctum/Helius on a
// personal dashboard. For real traffic, swap this for Vercel KV or a
// Supabase table written by a cron job — see README.

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const existing = store.get(key);
  if (existing && existing.expiresAt > now) {
    return existing.value as T;
  }

  const value = await fetcher();
  store.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
  return value;
}
