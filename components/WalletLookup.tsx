"use client";

import { useState, FormEvent } from "react";
import { GlassCard } from "./GlassCard";
import {
  atomicsToUi,
  formatTokenAmount,
  formatDate,
  isLikelySolanaAddress,
  shortenAddress,
} from "@/lib/format";
import type { WalletResponse } from "@/app/api/wallet/[address]/route";

type LoadState = "idle" | "loading" | "error" | "done";

const GOLD_THRESHOLD = 10;
const PLATINUM_THRESHOLD = 100;

type Tier = "platinum" | "gold" | null;

function getTier(balanceUi: number): Tier {
  if (balanceUi >= PLATINUM_THRESHOLD) return "platinum";
  if (balanceUi >= GOLD_THRESHOLD) return "gold";
  return null;
}

function TierBadge({ tier }: { tier: Tier }) {
  if (tier === "platinum") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-gradient-to-r from-[#8f99a8] via-[#e9eef4] to-[#8f99a8] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest2 text-[#1c2128] shadow-[0_0_16px_rgba(210,225,240,0.45)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1c2128]/70" />
        Platinum
      </span>
    );
  }
  if (tier === "gold") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f0c46a]/50 bg-gradient-to-r from-[#8a5a1e] via-[#e3b04b] to-[#8a5a1e] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest2 text-[#241503] shadow-[0_0_16px_rgba(227,176,75,0.45)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#241503]/70" />
        Gold
      </span>
    );
  }
  return null;
}

function BalanceTrack({ balanceUi }: { balanceUi: number }) {
  // Progress toward the next tier: <10 → toward Gold, 10-100 → toward
  // Platinum, ≥100 → full. Keeps the bar meaningful at every balance.
  let pct: number;
  let caption: string;
  let remaining: string | null = null;

  if (balanceUi >= PLATINUM_THRESHOLD) {
    pct = 100;
    caption = "Platinum tier reached";
  } else if (balanceUi >= GOLD_THRESHOLD) {
    pct = (balanceUi / PLATINUM_THRESHOLD) * 100;
    caption = `${Math.round(pct)}% to Platinum (${PLATINUM_THRESHOLD} rkuSOL)`;
    remaining = `${(PLATINUM_THRESHOLD - balanceUi).toFixed(2)} to go`;
  } else {
    pct = (balanceUi / GOLD_THRESHOLD) * 100;
    caption = `${Math.round(pct)}% to Gold (${GOLD_THRESHOLD} rkuSOL)`;
    remaining = `${(GOLD_THRESHOLD - balanceUi).toFixed(2)} to go`;
  }

  return (
    <div className="mt-3">
      <div className="relative h-3 overflow-hidden rounded-full border border-white/[0.08] bg-signal/[0.08]">
        <div
          className="animate-fillGrow relative h-full origin-left rounded-full bg-gradient-to-r from-eye-dim via-eye to-eye-bright shadow-[0_0_14px_rgba(99,201,60,0.55)]"
          style={{ width: `${Math.max(pct, balanceUi > 0 ? 2 : 0)}%` }}
        >
          <div className="animate-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-ash-500">
        <span>{caption}</span>
        {remaining && <span className="text-eye-bright">{remaining}</span>}
      </div>
    </div>
  );
}

export function WalletLookup() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WalletResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const address = input.trim();

    if (!isLikelySolanaAddress(address)) {
      setState("error");
      setError("That doesn't look like a valid Solana address.");
      setResult(null);
      return;
    }

    setState("loading");
    setError(null);

    try {
      const res = await fetch(`/api/wallet/${encodeURIComponent(address)}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error ?? "Lookup failed.");
      }

      setResult(json as WalletResponse);
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Lookup failed.");
      setResult(null);
    }
  }

  const balanceUi = result
    ? atomicsToUi(BigInt(result.balanceAtomics), result.decimals)
    : 0;
  const tier = result ? getTier(balanceUi) : null;

  return (
    <GlassCard className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Check a wallet</h3>
        <p className="mt-1 text-sm text-ash-400">
          Paste any Solana address — no wallet connection needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a Solana wallet address"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-ash-50 backdrop-blur-sm placeholder:text-ash-600 focus:border-eye/50"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-xl bg-gradient-to-r from-eye-dim to-eye px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest2 text-[#08130a] shadow-[0_0_18px_rgba(99,201,60,0.35)] transition-all hover:shadow-[0_0_24px_rgba(99,201,60,0.55)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === "loading" ? "Checking…" : "Check"}
        </button>
      </form>

      {state === "error" && error && (
        <p className="font-mono text-sm text-signal-bright">{error}</p>
      )}

      {state === "done" && result && (
        <div className="animate-riseIn rounded-xl border border-white/[0.08] bg-black/25 p-5 backdrop-blur-sm">
          {/* header: address + tier + rank + status */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs text-ash-400">
                {shortenAddress(result.address, 6)}
              </span>
              <TierBadge tier={tier} />
              {result.rank !== null && (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-ash-400">
                  Rank <span className="text-white">#{result.rank}</span>
                  <span className="text-ash-600">
                    {" "}
                    of {result.totalHolders.toLocaleString()}
                  </span>
                </span>
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest2 ${
                result.isHolder
                  ? "border border-eye/30 bg-eye/10 text-eye-bright"
                  : "border border-white/10 bg-white/[0.04] text-ash-500"
              }`}
            >
              {result.isHolder ? "Current holder" : "Not currently holding"}
            </span>
          </div>

          {/* balance — headline number + tier progress bar */}
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash-500">
              Balance
            </span>
            <div className="mt-1 text-3xl font-bold tracking-tight text-white">
              {formatTokenAmount(BigInt(result.balanceAtomics), result.decimals)}
              <span className="ml-2 text-base font-medium text-ash-400">
                rkuSOL
              </span>
            </div>
            <BalanceTrack balanceUi={balanceUi} />
          </div>

          {/* secondary stats */}
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-5">
            <Stat
              label="Days held"
              value={
                result.firstAcquisition !== null
                  ? result.daysHeld.toLocaleString()
                  : "—"
              }
            />
            <Stat label="Times held" value={result.timesHeld.toLocaleString()} />
            <Stat
              label="First acquired"
              value={
                result.firstAcquisition !== null
                  ? formatDate(result.firstAcquisition)
                  : "No record found"
              }
            />
          </dl>

          {result.historyTruncated && (
            <p className="mt-4 font-mono text-xs text-ash-600">
              This wallet has a long transaction history — figures reflect
              the earliest activity we could scan back to, and may not
              capture the very first acquisition.
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash-600">
        {label}
      </span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
