// rkuSOL mint — verified against https://docs.raiku.com/staking/rkusol
export const RKUSOL_MINT = "rkubjTrZYioRSeXwDnhwGQzvW3qkcin72JSxUt3WMVp";
export const WSOL_MINT = "So11111111111111111111111111111111111111112";

// Standard SPL Token program — used as the default owner-account filter.
// Overridden at runtime if the Sanctum metadata endpoint reports a different program.
export const DEFAULT_TOKEN_PROGRAM =
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

export const LINKS = {
  stake: "https://stake.raiku.com/",
  sanctumDeposit: "https://app.sanctum.so/stake/rkuSOL",
  jupiterSwap: `https://jup.ag/?sell=${WSOL_MINT}&buy=${RKUSOL_MINT}`,
  docs: "https://docs.raiku.com/staking/rkusol",
  solscan: `https://solscan.io/token/${RKUSOL_MINT}`,
};

// Cache lifetimes (seconds)
export const STATS_REVALIDATE_SECONDS = 900; // 15 min — holder count / TVL / APY
