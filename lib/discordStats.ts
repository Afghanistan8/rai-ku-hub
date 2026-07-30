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
  voiceSessions?: number; // number of separate voice/stage joins
  communityPosts?: number;
}

export interface DiscordChannelStats {
  name: string;
  url?: string; // e.g. https://discord.com/channels/<guildId>/<channelId>
  messages?: number;
  isContribution?: boolean; // marks the community-content channel
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
    voiceSessions?: number; // total voice/stage joins across the server
    communityPosts?: number;
  };
  channels?: DiscordChannelStats[]; // per-channel message breakdown
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
    for (const k of ["messages", "voiceMinutes", "voiceSessions", "communityPosts"] as const) {
      if (a[k] !== undefined && !isFiniteNonNegative(a[k])) return `activity.${k} must be a non-negative number`;
    }
  }

  if (b.channels !== undefined) {
    if (!Array.isArray(b.channels)) return "channels must be an array";
    if (b.channels.length > 100) return "channels is capped at 100 entries";
    for (const ch of b.channels) {
      if (typeof ch !== "object" || ch === null) return "each channel must be an object";
      const c = ch as Record<string, unknown>;
      if (typeof c.name !== "string" || c.name.length === 0 || c.name.length > 100) {
        return "each channel needs a name (1-100 chars)";
      }
      if (c.messages !== undefined && !isFiniteNonNegative(c.messages)) {
        return "channel messages must be a non-negative number";
      }
      if (c.url !== undefined) {
        if (typeof c.url !== "string" || c.url.length > 200) return "channel url must be a string (max 200 chars)";
        // Only accept real Discord channel links — this URL gets rendered as
        // a clickable link on the dashboard, so never let an arbitrary
        // destination through.
        if (!/^https:\/\/discord\.com\/channels\/\d+\/\d+$/.test(c.url)) {
          return "channel url must be a https://discord.com/channels/<guildId>/<channelId> link";
        }
      }
      if (c.isContribution !== undefined && typeof c.isContribution !== "boolean") {
        return "channel isContribution must be a boolean";
      }
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
      for (const k of ["messages", "voiceMinutes", "voiceSessions", "communityPosts"] as const) {
        if (cc[k] !== undefined && !isFiniteNonNegative(cc[k])) return `contributor ${k} must be a non-negative number`;
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
