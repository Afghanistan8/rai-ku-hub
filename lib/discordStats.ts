// Receives community stats pushed by Raiku's own Discord bot. We never talk
// to Discord directly — their bot POSTs aggregates here on a schedule.
//
// Storage is the same warm-instance memory model as the rest of the app:
// with hourly pushes, the worst case after a cold start is a short
// "awaiting next update" window, which the UI handles explicitly.

export interface DiscordContributor {
  name: string;
  messages?: number;
  voiceMinutes?: number;
  communityPosts?: number;
}

export interface DiscordStatsPayload {
  updatedAt?: string; // ISO timestamp from the bot; we stamp receivedAt ourselves
  roles: {
    gold: number;
    platinum: number;
  };
  activity?: {
    period?: string; // e.g. "7d", "30d" — whatever window the bot aggregates
    messages?: number;
    voiceMinutes?: number;
    communityPosts?: number;
  };
  topContributors?: DiscordContributor[];
}

export interface StoredDiscordStats extends DiscordStatsPayload {
  receivedAt: number; // unix ms, set server-side on receipt
}

let latest: StoredDiscordStats | null = null;

function isFiniteNonNegative(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

/** Validates an incoming payload. Returns an error string, or null if ok.
 * Strict on the required core (role counts), tolerant on optional extras. */
export function validatePayload(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return "body must be a JSON object";
  const b = body as Record<string, unknown>;

  const roles = b.roles as Record<string, unknown> | undefined;
  if (!roles || typeof roles !== "object") return "roles object is required";
  if (!isFiniteNonNegative(roles.gold)) return "roles.gold must be a non-negative number";
  if (!isFiniteNonNegative(roles.platinum)) return "roles.platinum must be a non-negative number";

  if (b.activity !== undefined) {
    if (typeof b.activity !== "object" || b.activity === null) return "activity must be an object";
    const a = b.activity as Record<string, unknown>;
    for (const k of ["messages", "voiceMinutes", "communityPosts"] as const) {
      if (a[k] !== undefined && !isFiniteNonNegative(a[k])) return `activity.${k} must be a non-negative number`;
    }
  }

  if (b.topContributors !== undefined) {
    if (!Array.isArray(b.topContributors)) return "topContributors must be an array";
    if (b.topContributors.length > 50) return "topContributors is capped at 50 entries";
    for (const c of b.topContributors) {
      if (typeof c !== "object" || c === null) return "each contributor must be an object";
      const cc = c as Record<string, unknown>;
      if (typeof cc.name !== "string" || cc.name.length === 0 || cc.name.length > 64) {
        return "each contributor needs a name (1-64 chars)";
      }
    }
  }

  return null;
}

export function storeDiscordStats(payload: DiscordStatsPayload): StoredDiscordStats {
  latest = { ...payload, receivedAt: Date.now() };
  return latest;
}

export function getDiscordStats(): StoredDiscordStats | null {
  return latest;
}
