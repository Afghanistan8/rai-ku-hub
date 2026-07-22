import Image from "next/image";
import { buildStats } from "@/lib/stats";
import { buildTopHolders } from "@/lib/holders";
import { StatsBar } from "@/components/StatsBar";
import { WalletLookup } from "@/components/WalletLookup";
import { StakeSection } from "@/components/StakeSection";
import { SectionLabel } from "@/components/SectionLabel";
import { TopHolders } from "@/components/TopHolders";
import { RingBackdrop } from "@/components/RingBackdrop";
import { LINKS } from "@/lib/constants";

export const revalidate = 900;

export default async function Home() {
  const [stats, topHolders] = await Promise.all([
    buildStats(),
    buildTopHolders(),
  ]);

  return (
    <main className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Mandala wheel — spans the whole hero, behind title AND mascots */}
        <RingBackdrop className="pointer-events-none absolute left-1/2 top-[54%] h-[780px] w-[780px] -translate-x-1/2 -translate-y-1/2 text-signal opacity-80 sm:h-[900px] sm:w-[900px]" />

        {/* Hero copy — generous breathing room */}
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-24 text-center sm:px-10 md:pt-32">
          <span className="font-mono text-xs uppercase tracking-widest2 text-signal">
            Solana · Liquid Staking
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
            rai ku hub
          </h1>
          <p className="max-w-xl text-balance leading-relaxed text-ash-200">
            Live holder stats for rkuSOL, Raiku&rsquo;s liquid staking token:
            the first Solana LST that routes blockspace auction revenue back
            to stakers alongside standard staking rewards and MEV.
          </p>
        </div>

        {/* Mascots — centered side by side, with a soft warm backlight so
            they sit IN the scene instead of on top of it */}
        <div className="relative z-10 mx-auto mt-14 flex items-end justify-center gap-6 pb-16 sm:gap-12">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/[0.13] blur-[100px]" />
          <div className="pointer-events-none absolute left-1/2 top-2/3 h-[140px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7a4ba0]/[0.10] blur-[80px]" />
          <Image
            src="/raiku-mascot.png"
            alt=""
            aria-hidden="true"
            width={640}
            height={801}
            priority
            className="relative h-[240px] w-auto -scale-x-100 animate-floatY object-contain drop-shadow-[0_36px_50px_rgba(0,0,0,0.65)] sm:h-[330px]"
          />
          <Image
            src="/raiku-mascot.png"
            alt="Raiku mascot"
            width={640}
            height={801}
            priority
            className="relative h-[240px] w-auto animate-floatY object-contain drop-shadow-[0_36px_50px_rgba(0,0,0,0.65)] sm:h-[330px]"
            style={{ animationDelay: "-3s" }}
          />
        </div>

        {/* Blend hero bottom into the page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#06040a]" />
      </section>

      {/* ===== CONTENT ===== */}
      <div className="mx-auto max-w-5xl px-6 pb-24 sm:px-10">
        <section className="mt-8">
          <StatsBar
            stats={stats}
            fallbackSupplyAtomics={topHolders.totalSupplyAtomics}
            top10Share={topHolders.holders
              .slice(0, 10)
              .reduce((sum, h) => sum + h.shareOfSupply, 0)}
          />
        </section>

        <SectionLabel>Lookup</SectionLabel>
        <section>
          <WalletLookup />
        </section>

        <SectionLabel>Holders</SectionLabel>
        <section>
          <TopHolders
            holders={topHolders.holders}
            totalHolders={topHolders.totalHolders}
          />
        </section>

        <SectionLabel>Stake</SectionLabel>
        <section>
          <StakeSection />
        </section>

        <footer className="mt-24 border-t border-card-border pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={LINKS.solscan}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-xs text-ash-400 underline decoration-ash-700 underline-offset-4 hover:text-signal"
            >
              View on Solscan
            </a>
            <a
              href={LINKS.docs}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-xs text-ash-400 underline decoration-ash-700 underline-offset-4 hover:text-signal"
            >
              Raiku docs
            </a>
          </div>
          <p className="mt-4 font-mono text-xs text-ash-600">
            Unofficial community dashboard. Not affiliated with Raiku or
            Sanctum. Figures update roughly every 15 minutes.
          </p>
          <p className="mt-2 font-mono text-xs text-ash-500">
            created by{" "}
            <a
              href="https://x.com/asuzu_a"
              target="_blank"
              rel="noreferrer noopener"
              className="text-signal underline decoration-signal-dim underline-offset-4 hover:text-signal-bright"
            >
              @asuzu_a
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
