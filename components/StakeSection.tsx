import { LinkCard } from "./LinkCard";
import { LINKS } from "@/lib/constants";

export function StakeSection() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <LinkCard
        title="Stake SOL"
        badge="RAIKU"
        description="Deposit SOL and receive rkuSOL instantly at the current exchange rate. Staking rewards, MEV, and blockspace auction revenue auto-compound into your position — no claiming required."
        href={LINKS.stake}
      />
      <LinkCard
        title="Deposit via Sanctum"
        badge="SANCTUM"
        description="rkuSOL is issued through Sanctum's staking infrastructure. Sanctum takes a 2.5% fee on staking rewards; Raiku charges none on top of that."
        href={LINKS.sanctumDeposit}
      />
      <LinkCard
        title="Swap for rkuSOL"
        badge="JUPITER"
        description="Already hold SOL or another LST? Swap directly into rkuSOL through Jupiter's aggregated routing instead of depositing fresh SOL."
        href={LINKS.jupiterSwap}
      />
    </div>
  );
}
