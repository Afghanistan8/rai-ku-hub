// Simple in-memory cache scoped to a single warm serverless instance.
// Good enough to stop every page load from re-hitting Helius on a personal
// dashboard. For real traffic, swap this for Vercel KV or a Supabase table
// written by a cron job — see README.

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// Wallet lookups are keyed by arbitrary user-supplied addresses, so without
// a cap this map would grow without bound if someone spammed distinct
// addresses. This keeps memory use predictable on a long-lived warm
// instance regardless of traffic pattern.
const MAX_ENTRIES = 500;

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

  if (store.size >= MAX_ENTRIES) {
    // Map preserves insertion order — the first key is the oldest entry.
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) store.delete(oldestKey);
  }

  store.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
  return value;
}
