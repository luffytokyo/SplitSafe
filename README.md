StealthPay is a mini app concept for Loyal's private transaction SDK. It turns the default starter into a polished private payroll and contributor payout demo for DAOs, bounties, and small teams.

## What it includes

- Private USDC treasury view
- Batch contributor payouts
- Wallet and Telegram-style recipient flows
- Hidden-amount proof-of-payment receipt
- Activity feed that sells the live product story during a demo

## Getting Started

Run the development server:

```bash
bun dev
```

Open `http://localhost:3000` in your browser.

## Product framing

Pitch line:

`Pay contributors on-chain without exposing what everyone earned.`

The current build is a frontend MVP designed to be wired into Loyal's SDK next. The action surfaces are already separated into realistic product moments:

- connect wallet
- shield USDC
- add payout recipients
- send private batch
- share hidden-amount receipt

## Next integration step

Replace the mocked deposit and payout handlers in [app/stealth-pay-app.tsx](/Users/vijaykv/Desktop/Challenge/my-bun-app/app/stealth-pay-app.tsx:1) with Loyal SDK calls once the SDK package and credentials are available in this repo.
