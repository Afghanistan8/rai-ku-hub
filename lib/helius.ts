import { RKUSOL_MINT } from "./constants";

const HELIUS_RPC = (key: string) =>
  `https://mainnet.helius-rpc.com/?api-key=${key}`;
const HELIUS_ENHANCED = (address: string, key: string, before?: string) =>
  `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${key}` +
  (before ? `&before=${before}` : "");

interface HeliusTokenTransfer {
  fromUserAccount?: string;
  toUserAccount?: string;
  tokenAmount?: number;
  mint?: string;
}

interface HeliusTransaction {
  signature: string;
  timestamp: number;
  tokenTransfers?: HeliusTokenTransfer[];
}

export interface MintTransferEvent {
  signature: string;
  timestamp: number; // unix seconds
  deltaAtomics: bigint; // positive = received, negative = sent, in raw atomics
}

export interface WalletHoldingStats {
  currentBalanceAtomics: bigint;
  firstAcquisitionTs: number | null;
  timesHeld: number;
  daysHeld: number;
  historyTruncated: boolean;
  transferCount: number;
}

function requireKey(): string {
  const key = process.env.HELIUS_API_KEY;
  if (!key) {
    throw new Error(
      "HELIUS_API_KEY is not set. Add it to your environment before querying wallets."
    );
  }
  return key;
}

/** Live on-chain balance for a wallet's rkuSOL holdings, in raw atomics. */
export async function getLiveBalanceAtomics(
  owner: string,
  mint: string = RKUSOL_MINT
): Promise<bigint> {
  const key = requireKey();
  const res = await fetch(HELIUS_RPC(key), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "rkusol-balance",
      method: "getTokenAccountsByOwner",
      params: [owner, { mint }, { encoding: "jsonParsed" }],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Helius RPC error (${res.status})`);
  }

  const json = await res.json();
  const accounts = json?.result?.value ?? [];

  let total = 0n;
  for (const acc of accounts) {
    const amountStr =
      acc?.account?.data?.parsed?.info?.tokenAmount?.amount ?? "0";
    total += BigInt(amountStr);
  }
  return total;
}

/**
 * Walks a wallet's full parsed transaction history (paginated, newest-first
 * from the API, returned oldest-first here) and extracts every transfer that
 * moved the rkuSOL mint in or out of the wallet.
 *
 * Capped at MAX_PAGES to bound Helius credit usage on very active wallets —
 * if the cap is hit, `truncated` is set so callers can be upfront that the
 * "first acquisition" date may not reach all the way back.
 */
export async function fetchMintTransferHistory(
  owner: string,
  mint: string = RKUSOL_MINT
): Promise<{ events: MintTransferEvent[]; truncated: boolean }> {
  const key = requireKey();
  const MAX_PAGES = 40;
  const PAGE_SIZE_HINT = 100;

  const events: MintTransferEvent[] = [];
  let before: string | undefined = undefined;
  let truncated = false;

  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await fetch(HELIUS_ENHANCED(owner, key, before), {
      cache: "no-store",
    });

    if (!res.ok) {
      // Wallet with zero transaction history returns fine; treat other
      // non-OK responses as a hard stop rather than silently under-counting.
      if (res.status === 404) break;
      throw new Error(`Helius enhanced tx error (${res.status})`);
    }

    const batch: HeliusTransaction[] = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    for (const tx of batch) {
      for (const transfer of tx.tokenTransfers ?? []) {
        if (transfer.mint !== mint) continue;
        if (typeof transfer.tokenAmount !== "number") continue;

        // Helius reports tokenAmount as a UI (decimal) figure. Convert back
        // to integer atomics using 9 decimals (standard for SOL-denominated
        // LSTs) to avoid float drift when summing many small transfers.
        const atomics = BigInt(Math.round(transfer.tokenAmount * 1e9));

        if (transfer.toUserAccount === owner) {
          events.push({
            signature: tx.signature,
            timestamp: tx.timestamp,
            deltaAtomics: atomics,
          });
        } else if (transfer.fromUserAccount === owner) {
          events.push({
            signature: tx.signature,
            timestamp: tx.timestamp,
            deltaAtomics: -atomics,
          });
        }
      }
    }

    const last = batch[batch.length - 1];
    if (!last) break;
    before = last.signature;

    if (batch.length < PAGE_SIZE_HINT) break; // fewer than a full page = done
    if (page === MAX_PAGES - 1) truncated = true;
  }

  events.sort((a, b) => a.timestamp - b.timestamp);
  return { events, truncated };
}

/**
 * Reconstructs holding behavior from a chronological transfer list:
 * - firstAcquisitionTs: the first time the wallet's balance crossed 0 -> positive
 * - timesHeld: how many separate times that has happened (re-entries after
 *   fully exiting count separately)
 * - daysHeld: days since firstAcquisitionTs, regardless of gaps in between
 */
export function computeHoldingStats(
  events: MintTransferEvent[],
  liveBalanceAtomics: bigint,
  truncated: boolean
): WalletHoldingStats {
  let running = 0n;
  let firstAcquisitionTs: number | null = null;
  let timesHeld = 0;

  for (const ev of events) {
    const before = running;
    running += ev.deltaAtomics;
    if (before <= 0n && running > 0n) {
      timesHeld += 1;
      if (firstAcquisitionTs === null) {
        firstAcquisitionTs = ev.timestamp;
      }
    }
  }

  // Wallet currently holds tokens but we found no inbound transfer in the
  // window we scanned (pre-dates history cap, or came from a mint/airdrop
  // path Helius classified outside tokenTransfers). Be honest about it
  // rather than reporting a false "0 days held".
  const balanceUnexplained = liveBalanceAtomics > 0n && firstAcquisitionTs === null;

  const daysHeld =
    firstAcquisitionTs !== null
      ? Math.max(
          0,
          Math.floor((Date.now() / 1000 - firstAcquisitionTs) / 86400)
        )
      : 0;

  return {
    currentBalanceAtomics: liveBalanceAtomics,
    firstAcquisitionTs,
    timesHeld,
    daysHeld,
    historyTruncated: truncated || balanceUnexplained,
    transferCount: events.length,
  };
}

export interface HolderEntry {
  owner: string;
  balanceAtomics: bigint;
}

/**
 * Full ranked holder list via DAS token-account enumeration. Aggregates
 * balance per owner (a wallet can technically hold the mint across more
 * than one token account) and sorts descending. This is the same call
 * getHolderCountFallback and getTopHolders both build on, since Sanctum's
 * public API exposes a holder *count* but not the list itself.
 */
export async function getAllHolders(
  mint: string = RKUSOL_MINT
): Promise<HolderEntry[]> {
  const key = requireKey();
  const balances = new Map<string, bigint>();
  let page = 1;

  for (let i = 0; i < 50; i++) {
    const res = await fetch(HELIUS_RPC(key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "rkusol-holders",
        method: "getTokenAccounts",
        params: { mint, page, limit: 1000 },
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      if (page === 1) {
        throw new Error(`Helius getTokenAccounts error (${res.status})`);
      }
      break;
    }
    const json = await res.json();
    const accounts = json?.result?.token_accounts ?? [];
    if (accounts.length === 0) break;

    for (const acc of accounts) {
      const amount = BigInt(acc.amount ?? "0");
      if (amount <= 0n) continue;
      const prev = balances.get(acc.owner) ?? 0n;
      balances.set(acc.owner, prev + amount);
    }

    if (accounts.length < 1000) break;
    page += 1;
  }

  return Array.from(balances.entries())
    .map(([owner, balanceAtomics]) => ({ owner, balanceAtomics }))
    .sort((a, b) => (a.balanceAtomics < b.balanceAtomics ? 1 : -1));
}

/** Total holder count — thin wrapper over getAllHolders for callers that
 * only need the number (kept separate so the stats route doesn't pay for
 * building the full ranked list when it just needs a count). */
export async function getHolderCountFallback(
  mint: string = RKUSOL_MINT
): Promise<number> {
  const holders = await getAllHolders(mint);
  return holders.length;
}
