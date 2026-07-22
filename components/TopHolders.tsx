"use client";

import { useState } from "react";
import { Card } from "./Card";
import { formatTokenAmount, formatPercent, shortenAddress } from "@/lib/format";
import type { RankedHolder } from "@/lib/holders";

const INITIAL_VISIBLE = 50;

export function TopHolders({
  holders,
  totalHolders,
}: {
  holders: RankedHolder[];
  totalHolders: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (holders.length === 0) {
    return (
      <Card>
        <p className="font-mono text-sm text-ash-500">
          Holder list unavailable right now.
        </p>
      </Card>
    );
  }

  const visible = expanded ? holders : holders.slice(0, INITIAL_VISIBLE);
  const canExpand = holders.length > INITIAL_VISIBLE;

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
        <h3 className="text-lg font-semibold text-ash-50">Top holders</h3>
        <span className="font-mono text-xs text-ash-600">
          Showing {visible.length} of {totalHolders.toLocaleString()}
        </span>
      </div>

      <div className="max-h-[560px] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-card">
            <tr className="font-mono text-[11px] uppercase tracking-widest2 text-ash-600">
              <th className="px-6 py-2 font-normal">#</th>
              <th className="px-2 py-2 font-normal">Address</th>
              <th className="px-2 py-2 font-normal text-right">Balance</th>
              <th className="px-6 py-2 font-normal text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((h) => (
              <tr
                key={h.owner}
                className="border-t border-card-border/60 text-sm transition-colors hover:bg-ink/40"
              >
                <td className="px-6 py-2.5 font-mono text-ash-600">
                  {h.rank}
                </td>
                <td className="px-2 py-2.5">
                  <a
                    href={`https://solscan.io/account/${h.owner}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-mono text-ash-400 hover:text-signal"
                  >
                    {shortenAddress(h.owner, 5)}
                  </a>
                </td>
                <td className="px-2 py-2.5 text-right text-ash-50">
                  {formatTokenAmount(BigInt(h.balanceAtomics))}
                </td>
                <td className="px-6 py-2.5 text-right font-mono text-ash-500">
                  {formatPercent(h.shareOfSupply)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canExpand && (
        <div className="border-t border-card-border px-6 py-4">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="font-mono text-xs uppercase tracking-widest2 text-signal hover:text-signal-bright"
          >
            {expanded ? "Show top 50 only" : `Show all ${holders.length}`}
          </button>
        </div>
      )}
    </Card>
  );
}
