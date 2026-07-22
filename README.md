# rai ku hub

Community dashboard for **rkuSOL**, Raiku's Solana liquid staking token.
Live at [rai-kuhub.xyz](https://rai-kuhub.xyz).

## Features

- **Holder stats** — total holder count and total value staked, pulled
  directly from on-chain data.
- **Top holders leaderboard** — ranked by balance, top 50 shown with an
  option to expand to the full list.
- **Wallet lookup** — paste any Solana address, no wallet connection
  required. Shows current balance, rank among all holders, days held
  (since first acquisition), and times held (distinct buy-in events after
  fully exiting).
- **Gold / Platinum tiers** — wallets holding 10+ rkuSOL get a Gold badge,
  100+ gets Platinum.
- **Stake guide** — links out to Raiku, Sanctum, and Jupiter for actually
  acquiring rkuSOL.

## Stack

Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel. Data
comes from the [Helius](https://helius.dev) API — no separate backend or
database.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your Helius key to `.env.local`:

```
HELIUS_API_KEY=your_key_here
```

Free tier (1M credits/month) is enough to run this comfortably.

## How the wallet stats work

rkuSOL doesn't rebase — yield shows up as the SOL-per-rkuSOL exchange rate
increasing, not as new tokens landing in your wallet. That means balance
only moves on real deposits, withdrawals, or transfers, so the holding
metrics are derived cleanly from a wallet's transfer history:

- **Days held** — days since the wallet's balance first went from 0 to
  positive.
- **Times held** — how many separate times that's happened. Buy, fully
  exit, buy back in later, and that's 2.

Both come from walking a wallet's full parsed transfer history for the
rkuSOL mint via Helius, using integer atomics throughout to avoid float
drift. Current balance is fetched separately and live, so it stays
accurate even if the history scan is incomplete for very active wallets
(pagination is capped to keep API usage sane — the UI flags it when that
cap is hit).

## Caching

Stats and wallet lookups sit behind a small in-memory TTL cache
(`lib/cache.ts`) — fine for the traffic this gets today. If that changes,
swap it for Vercel KV or a Postgres table on a cron refresh; `lib/stats.ts`
and `lib/helius.ts` are already structured so that swap doesn't touch the
UI layer.

## Deploying

Push to GitHub, import into Vercel, add `HELIUS_API_KEY` in Project
Settings, deploy.
