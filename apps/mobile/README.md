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

- `App.tsx` — bootstraps the session from AsyncStorage, renders the nav.
- `src/navigation/RootNavigator.tsx` — react-navigation native stack. Two
  trees: signed-out (Welcome → Onboarding) and signed-in (Home → Group/Event
  flows).
- `src/screens/Welcome.tsx` — landing.
- `src/onboarding/OnboardingFlow.tsx` — 5-step state machine (90-second profile).
- `src/screens/Home.tsx` — groups + upcoming events list.
- `src/screens/groups/CreateGroup.tsx`, `GroupDetail.tsx`, `AddMember.tsx`.
- `src/screens/events/CreateEvent.tsx`, `EventDetail.tsx` — Secret Santa
  draw and AI suggestions live here.
- `src/api/client.ts` — fetch wrapper covering every backend endpoint.
- `src/storage/session.ts` — AsyncStorage userId persistence.
- `src/theme.ts` — colors, spacing, type scale.

## Scope (v1)

The mobile surface for the v1 substrate is now complete: profile creation,
groups, events (Secret Santa + Birthday), draw, and AI suggestions. Auth
arrives next, replacing the synthetic test users with real Supabase accounts.
