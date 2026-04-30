# @prsnt/mobile

React Native + Expo app — iOS and Android.

## Run

```bash
pnpm dev          # Expo dev server
pnpm ios          # iOS simulator
pnpm android      # Android emulator
```

Scan the QR code with Expo Go on your phone, or press `i` / `a` for sim/emulator.

## API base URL

By default the app posts to `http://localhost:3000`. Override with `EXPO_PUBLIC_API_URL` if you're tunneling or running on a real device:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.42:3000 pnpm dev
```

## What's here

- `App.tsx` — three-state app shell: `welcome → onboarding → done`
- `src/screens/Welcome.tsx`, `src/screens/Done.tsx`
- `src/onboarding/OnboardingFlow.tsx` — 5-step state machine, no router needed at this scale
- `src/onboarding/steps/` — one component per step (Name, Birthday, PartyStyle, Categories, WontBuySelf)
- `src/api/client.ts` — fetch wrapper for `POST /onboarding`
- `src/theme.ts` — colors, spacing, type scale

## Scope (v1)

The 90-second profile flow from `docs/STRATEGY.md` §2 lands here. Auth, group creation, event flows, and gift-suggestion UI all come next.
