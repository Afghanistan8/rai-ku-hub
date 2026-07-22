import { NextResponse } from "next/server";
import {
  fetchMintTransferHistory,
  getLiveBalanceAtomics,
  computeHoldingStats,
} from "@/lib/helius";
import { getCachedAllHolders } from "@/lib/holders";
import { cached } from "@/lib/cache";
import { isLikelySolanaAddress } from "@/lib/format";

export const dynamic = "force-dynamic";

export interface WalletResponse {
  address: string;
  isHolder: boolean;
  balanceAtomics: string; // stringified bigint — safe over JSON
  decimals: number;
  firstAcquisition: number | null; // unix seconds
  daysHeld: number;
  timesHeld: number;
  historyTruncated: boolean;
  transferCount: number;
  rank: number | null; // null if not currently a holder
  totalHolders: number;
  updatedAt: number;
}

const DECIMALS = 9; // standard for SOL-denominated LSTs, incl. rkuSOL

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address: rawAddress } = await params;
  const address = rawAddress?.trim();

  if (!address || !isLikelySolanaAddress(address)) {
    return NextResponse.json(
      { error: "That doesn't look like a valid Solana address." },
      { status: 400 }
    );
  }

  try {
    const result = await cached<WalletResponse>(
      `wallet:${address}`,
      60,
      async () => {
        const [liveBalance, history, allHolders] = await Promise.all([
          getLiveBalanceAtomics(address),
          fetchMintTransferHistory(address),
          getCachedAllHolders(),
        ]);

        const stats = computeHoldingStats(
          history.events,
          liveBalance,
          history.truncated
        );

        const idx = allHolders.findIndex((h) => h.owner === address);

        return {
          address,
          isHolder: stats.currentBalanceAtomics > 0n,
          balanceAtomics: stats.currentBalanceAtomics.toString(),
          decimals: DECIMALS,
          firstAcquisition: stats.firstAcquisitionTs,
          daysHeld: stats.daysHeld,
          timesHeld: stats.timesHeld,
          historyTruncated: stats.historyTruncated,
          transferCount: stats.transferCount,
          rank: idx === -1 ? null : idx + 1,
          totalHolders: allHolders.length,
          updatedAt: Date.now(),
        };
      }
    );

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Couldn't look up that wallet right now.",
      },
      { status: 502 }
    );
  }
}
