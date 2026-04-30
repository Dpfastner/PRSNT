# PRSNT (codename)

> **Note:** "PRSNT" is a working codename. The product needs a new name before App Store submission — `prsnt.io` is taken by an existing gift site. See `docs/NAMING.md`.

A mobile app that makes gift-giving easier for people who already love each other.

**Thesis:** gift-giving is an act of love that has been turned into a chore. PRSNT removes the chore, keeps the love.

## What's here

- `docs/STRATEGY.md` — full product strategy, architecture, roadmap
- `docs/NAMING.md` — name candidate shortlist
- `apps/mobile` — React Native + Expo app (iOS + Android)
- `apps/api` — Node.js + Postgres backend
- `packages/algorithm` — profile → gift-suggestion pipeline (Claude + retailer APIs)
- `packages/secret-santa` — constraint-aware draw + tests

## Getting started

Requires Node 20+ and pnpm 9+.

```bash
pnpm install
pnpm dev          # starts api + mobile in parallel
pnpm test         # runs all package tests
```

See each workspace's README for specifics.

## Architecture in one sentence

**Profiles is the platform; events (Secret Santa, Birthdays, etc.) are extensions on top.** The suggestion engine composes Profile + Event-occasion-context into a Claude prompt. New event types are mostly UI + a new occasion-context template.

## v1 launch surface

Profiles + Secret Santa + Birthdays. Target: mid-October App Store submission, before the holiday wave.
