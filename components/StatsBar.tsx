import { atomicsToUi, formatCompactNumber } from "@/lib/format";
import { GlassCard } from "./GlassCard";
import type { StatsResponse } from "@/lib/stats";

/** Next "round" milestone above n: 1 / 2 / 2.5 / 5 × 10^k */
function nextMilestone(n: number): number {
  if (n <= 0) return 100;
  const mag = 10 ** Math.floor(Math.log10(n));
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * mag > n) return m * mag;
  }
  return 10 * mag;
}

function ProgressTrack({
  pct,
  delayMs = 0,
}: {
  pct: number; // 0..100
  delayMs?: number;
}) {
  return (
    <div className="relative h-3 overflow-hidden rounded-full border border-white/[0.08] bg-signal/[0.08]">
      <div
        className="animate-fillGrow relative h-full origin-left rounded-full bg-gradient-to-r from-eye-dim via-eye to-eye-bright shadow-[0_0_14px_rgba(99,201,60,0.55)]"
        style={{ width: `${pct}%`, animationDelay: `${delayMs}ms` }}
      >
        <div className="animate-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>
    </div>
  );
}

export function StatsBar({
  stats,
  fallbackSupplyAtomics,
  top10Share,
}: {
  stats: StatsResponse;
  fallbackSupplyAtomics?: string;
  top10Share?: number; // 0..1
}) {
  const holders = stats.holders;
  const supply = fallbackSupplyAtomics
    ? atomicsToUi(BigInt(fallbackSupplyAtomics))
    : null;

  const holdersGoal = holders !== null ? nextMilestone(holders) : null;
  const holdersPct =
    holders !== null && holdersGoal ? (holders / holdersGoal) * 100 : 0;

  const supplyGoal = supply !== null ? nextMilestone(supply) : null;
  const supplyPct =
    supply !== null && supplyGoal ? (supply / supplyGoal) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* ===== HOLDERS ===== */}
      <GlassCard>
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-xs uppercase tracking-widest2 text-ash-400">
            Total holders
          </span>
          <span className="flex items-center gap-2 font-mono text-[11px] text-ash-500">
            <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-eye shadow-[0_0_6px_rgba(99,201,60,0.9)]" />
            live · on-chain
          </span>
        </div>

        <div className="mt-3 text-4xl font-bold tracking-tight text-white">
          {holders !== null ? holders.toLocaleString() : "—"}
        </div>

        <div className="mt-5">
          <ProgressTrack pct={holdersPct} />
          <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-ash-500">
            <span>
              {holders !== null && holdersGoal
                ? `${Math.round(holdersPct)}% to ${holdersGoal.toLocaleString()} holders`
                : "unavailable right now"}
            </span>
            {holders !== null && holdersGoal && (
              <span className="text-eye-bright">
                {(holdersGoal - holders).toLocaleString()} to go
              </span>
            )}
          </div>
        </div>
      </GlassCard>

      {/* ===== VALUE STAKED ===== */}
      <GlassCard>
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-xs uppercase tracking-widest2 text-ash-400">
            Total value staked
          </span>
          <span className="font-mono text-[11px] text-ash-500">
            rkuSOL supply
          </span>
        </div>

        <div className="mt-3 text-4xl font-bold tracking-tight text-white">
          {supply !== null ? (
            <>
              {formatCompactNumber(supply)}
              <span className="ml-2 text-lg font-medium text-ash-400">
                rkuSOL
              </span>
            </>
          ) : (
            "—"
          )}
        </div>

        <div className="mt-5">
          <ProgressTrack pct={supplyPct} delayMs={150} />
          <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-ash-500">
            <span>
              {supply !== null && supplyGoal
                ? `${Math.round(supplyPct)}% to ${formatCompactNumber(supplyGoal)}`
                : "unavailable right now"}
            </span>
            {typeof top10Share === "number" && (
              <span>
                top 10 hold{" "}
                <span className="text-eye-bright">
                  {(top10Share * 100).toFixed(1)}%
                </span>
              </span>
            )}
          </div>

          {typeof top10Share === "number" && (
            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full border border-white/[0.06]">
              <div
                className="animate-fillGrow origin-left bg-gradient-to-r from-eye-dim to-eye"
                style={{
                  width: `${top10Share * 100}%`,
                  animationDelay: "400ms",
                }}
              />
              <div className="flex-1 bg-signal/[0.1]" />
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
