import { getHolderCountFallback } from "./helius";
import { RKUSOL_MINT } from "./constants";

export interface StatsResponse {
  mint: string;
  holders: number | null;
  holdersSource: "helius" | "unavailable";
  updatedAt: number;
}

export async function buildStats(): Promise<StatsResponse> {
  try {
    const holders = await getHolderCountFallback();
    return {
      mint: RKUSOL_MINT,
      holders,
      holdersSource: "helius",
      updatedAt: Date.now(),
    };
  } catch {
    return {
      mint: RKUSOL_MINT,
      holders: null,
      holdersSource: "unavailable",
      updatedAt: Date.now(),
    };
  }
}
