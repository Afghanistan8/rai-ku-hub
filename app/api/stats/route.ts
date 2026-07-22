import { NextResponse } from "next/server";
import { buildStats } from "@/lib/stats";
import { cached } from "@/lib/cache";
import { STATS_REVALIDATE_SECONDS } from "@/lib/constants";

export const dynamic = "force-dynamic"; // caching handled explicitly below

export async function GET() {
  try {
    const data = await cached("lst-stats", STATS_REVALIDATE_SECONDS, buildStats);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
