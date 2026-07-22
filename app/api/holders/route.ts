import { NextResponse } from "next/server";
import { buildTopHolders } from "@/lib/holders";
import { cached } from "@/lib/cache";
import { STATS_REVALIDATE_SECONDS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await cached(
      "top-holders",
      STATS_REVALIDATE_SECONDS,
      buildTopHolders
    );
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
