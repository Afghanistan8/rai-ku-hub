import { NextResponse } from "next/server";
import {
  validatePayload,
  storeDiscordStats,
  getDiscordStats,
  type DiscordStatsPayload,
} from "@/lib/discordStats";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024; // stats payloads are tiny; anything bigger is wrong

function authorized(req: Request): boolean {
  const token = process.env.DISCORD_STATS_TOKEN;
  if (!token) return false; // endpoint disabled until a token is configured
  return req.headers.get("authorization") === `Bearer ${token}`;
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON" }, { status: 400 });
  }

  const problem = validatePayload(body);
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 422 });
  }

  const stored = storeDiscordStats(body as DiscordStatsPayload);
  return NextResponse.json({
    ok: true,
    receivedAt: new Date(stored.receivedAt).toISOString(),
  });
}

// Public read — the dashboard (and anyone curious) can see the latest stats.
export async function GET() {
  const stats = getDiscordStats();
  if (!stats) {
    return NextResponse.json(
      { available: false, reason: "awaiting first update from the bot" },
      { status: 200 }
    );
  }
  return NextResponse.json({ available: true, ...stats });
}
