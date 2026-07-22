import { getAllHolders, type HolderEntry } from "./helius";
import { cached } from "./cache";
import { STATS_REVALIDATE_SECONDS } from "./constants";

export interface RankedHolder {
  rank: number;
  owner: string;
  balanceAtomics: string; // stringified bigint, safe over JSON
  shareOfSupply: number; // 0..1
}

export interface HoldersResponse {
  holders: RankedHolder[];
  totalHolders: number;
  totalSupplyAtomics: string;
  updatedAt: number;
}

// We only ever display the top slice, so there's no point ranking or
// serializing more than this many even when the full holder set is larger.
const MAX_RANKED = 200;

/** Full holder list (all wallets, unranked slice), cached so the holders
 * leaderboard and the wallet-lookup rank check share one Helius fetch
 * instead of each re-enumerating every token account. */
export async function getCachedAllHolders(): Promise<HolderEntry[]> {
  return cached("all-holders-raw", STATS_REVALIDATE_SECONDS, () =>
    getAllHolders()
  );
}

export async function buildTopHolders(): Promise<HoldersResponse> {
  let all: HolderEntry[];
  try {
    all = await getCachedAllHolders();
  } catch {
    return {
      holders: [],
      totalHolders: 0,
      totalSupplyAtomics: "0",
      updatedAt: Date.now(),
    };
  }

  const totalSupplyAtomics = all.reduce(
    (sum, h) => sum + h.balanceAtomics,
    0n
  );

  const top = all.slice(0, MAX_RANKED);
  const totalSupplyNum = Number(totalSupplyAtomics);

  const holders: RankedHolder[] = top.map((h, i) => ({
    rank: i + 1,
    owner: h.owner,
    balanceAtomics: h.balanceAtomics.toString(),
    shareOfSupply:
      totalSupplyNum > 0 ? Number(h.balanceAtomics) / totalSupplyNum : 0,
  }));

  return {
    holders,
    totalHolders: all.length,
    totalSupplyAtomics: totalSupplyAtomics.toString(),
    updatedAt: Date.now(),
  };
}
