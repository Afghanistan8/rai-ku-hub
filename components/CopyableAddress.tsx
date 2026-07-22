"use client";

import { useState } from "react";
import { shortenAddress } from "@/lib/format";

export function CopyableAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable (e.g. insecure context) — fail quietly.
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card px-3 py-1.5 font-mono text-xs text-ash-400 transition-colors hover:border-card-borderHover hover:text-ash-50"
      title={address}
    >
      {shortenAddress(address, 4)}
      <span className="text-ash-600">{copied ? "copied" : "copy"}</span>
    </button>
  );
}
