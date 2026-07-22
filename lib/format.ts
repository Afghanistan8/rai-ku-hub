export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function atomicsToUi(atomics: bigint, decimals = 9): number {
  const divisor = 10 ** decimals;
  return Number(atomics) / divisor;
}

export function formatTokenAmount(atomics: bigint, decimals = 9): string {
  const ui = atomicsToUi(atomics, decimals);
  return ui.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

export function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function isLikelySolanaAddress(value: string): boolean {
  // Base58, 32-44 chars — good enough client-side sanity check before we
  // spend an API call on it. Full validation happens against the RPC result.
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value.trim());
}
