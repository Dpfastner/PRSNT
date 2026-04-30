# PRSNT — Product & Strategy Plan

## Context

PRSNT is a mobile app that makes gift-giving easier for people who already love each other. Two core flows:

1. **Profiles for loved ones.** A user fills out a profile (preferences + personality) once, shares it with a family/friend group, and an AI helps anyone in that group find a thoughtful gift, plan a birthday, etc.
2. **Smart Secret Santa.** Group organizer sets rules + a short questionnaire; the app handles drawing while respecting constraints (no spouses, no repeats year-over-year, no mutual draws).

Thesis: **gift-giving is an act of love that has been turned into a chore.** PRSNT removes the chore, keeps the love. The non-negotiable UX principle is *ease* — if filling it out feels like work, no one does it, and the network never reaches critical mass.

The current MVP is a 16-section Google Form. It's smarter than it looks (conditional logic, age gating, three excellent question patterns), but it's a one-sitting wall of work — the opposite of what the product needs to be.

> **Naming blocker (high priority).** "PRSNT" is taken — `prsnt.io` is already a gift-giving site. The product needs a new name **before** any brand investment (logo, App Store listing, marketing site, social handles, affiliate-program applications). See §0 below for the rename workstream.

"PRSNT" is the working codename in this repo until a new name is chosen. See `docs/NAMING.md`.

---

## 0. Renaming

Pick the new name in the next 1–2 weeks. Criteria:

- **Available everywhere:** `.com`, iOS App Store, Google Play Store, Instagram, TikTok, X. Use namechk.com.
- **Trademark-clear** in launch geography (USPTO basic search; lawyer before filing).
- **Searchable:** unique enough that "<name> gift app" returns *you* on Google.
- **Pronounceable:** real word or near-word, not a forced consonant cluster.
- **Carries the irreverent voice.** Brand voice is the moat.
- **Not a "gift" pun fatigue victim:** Giftly, Gifted, Giftster, Wantist, Elfster, etc. all already exist.

**Action:** generate 20–30 candidates, filter for domain + handle + trademark availability, narrow to 3, test with 10 target users.

---

## 1. MVP Form Audit

### What's gold (keep, build the product around these)

- **Section 12 — "Things you LIKE but would never buy for yourself."** This is the entire psychology of gift-giving in one question. *Primary* signal in the algorithm.
- **Section 14 — "$10-or-less items you use regularly."** Solves stocking stuffers, low-stakes gifts.
- **Section 16 — "Secret gift you've always wanted but never received."** Emotional payoff. Raises a real visibility question (see §2).
- **Section 3 — Types of Gifts checklist.** Near-perfect top-level taxonomy. Reuse as the algorithm's coarse filter.
- **The voice.** "Straight Cash Homie", "blood of your enemies", "Pile of Bacon" — this is brand.
- **Conditional logic already there.** Fiction → genres, video games → systems, age gate → alcohol.

### What to refactor

- **One-sitting completion is wrong.** 16 sections at signup = abandonment. Drip across days/weeks.
- **Free-text fields are algorithm-hostile.** Convert to autocomplete chips with a controlled vocabulary; free-text as fallback.
- **Sizes belong in a separate "Facts" surface,** one-tap-editable forever.
- **No personality questionnaire yet.** Add a 10-item Big-Five short-form (TIPI).
- **No "do not gift" list.** Allergies, recovery (no alcohol), values, already-owned.

---

## 2. Product Strategy

### Architecture mental model — Profiles as platform, Events as extensions

```
                         ┌────────────────────────┐
                         │   PROFILE PLATFORM     │
                         │  (preferences, traits, │
                         │   sizes, wish list,    │
                         │   relationships,       │
                         │   gift history)        │
                         └───────────┬────────────┘
                                     │
   ┌──────────────┬─────────────┬────┴────┬──────────────┬───────────────┐
   ▼              ▼             ▼         ▼              ▼               ▼
Secret Santa  Birthdays   Anniversaries  Graduations  Weddings/Baby  Corporate
```

Every event type is a thin layer on top of Profiles: each one supplies its own **occasion context** (rules, budget, deadline, group composition, vibe), and asks the same suggestion engine, "given this person's profile and this occasion, what should I get?"

- **Profiles is the moat,** not any individual event.
- **Adding event types is the growth strategy.** Each opens a new acquisition surface without rebuilding the engine.
- **Build the abstraction once, well.** An "Event" entity with: type, participants, dates, budget, rules, occasion-context, suggestion-history.

### v1 launch surface: Profiles + Secret Santa + Birthdays

- **Secret Santa** — November forcing function, viral loop, proven category. Highest acquisition leverage.
- **Birthdays** — every profile already has one. Year-round retention engine.
- **Anniversaries / Graduations / Weddings / Baby / Corporate** — same engine, additional UI, ship one per quarter post-launch.

### Solo-founder build order

1. Weeks 1–6: shared platform (auth, profile schema, groups, suggestion pipeline, Event abstraction).
2. Weeks 6–9: Birthday surface (calendar, per-person suggestions, drip prompts).
3. Weeks 9–12: Secret Santa surface (events, invites, constraint draw, match view).
4. Weeks 12–14: polish, App Store review, marketing site. Mid-October target.

### Onboarding redesign

- **First 90 seconds:** name, birthday, party-style, top 3 gift categories, top 3 "won't buy myself." Profile is live.
- **Drip the rest.** "Today's question" prompts. Tinder-style swipes where possible.
- **Profiles improve in the background.** Giver interactions are implicit signal.
- **Re-confirmation, not re-asking.** Annual "still true?" sweep ~2 weeks before birthday.

### Visibility tiers — solve the surprise/transparency tension

| Tier | Who sees | What they see |
|---|---|---|
| **Open** | Anyone in your groups | Sizes, colors, no-gift list, gift-card stores, top categories |
| **Hint** | Anyone in your groups | AI-generated *category* suggestions, not specific items |
| **Sealed** | Only the AI | Wish list, secret wish, "won't buy myself" specifics |

---

## 3. Data Model

### Top-level entities

- **User** — identity, auth, settings.
- **Profile** — rich preference + personality data for one user. Versioned.
- **Group** — persistent collection of users with relationships (family, friends, coworkers).
- **Relationship** — directed edge between two users in a group, with type (spouse, parent, child, sibling, friend, coworker). Drives Secret Santa constraints and gift-suggestion context.
- **Event** — first-class object. Type (Secret Santa, Birthday, Anniversary, Graduation, Wedding, Baby Shower, Corporate, "Just Because"), participants, dates, budget, rules, occasion-context, gift-history.
- **Suggestion** — generated for `(giver, recipient, event)`. Stores LLM rationale, catalog item(s), giver's reaction.
- **Gift** — a record of something actually given. Powers dedup, history, "no repeats."

The engine doesn't care what kind of event it is. It composes Profile + Event.occasion-context.

### Fields by mutability

| Mutability | Examples | UX implication |
|---|---|---|
| **Static** (set once) | Name, birthday | Ask at signup, never re-prompt |
| **Slow** (yearly) | Party style, hobbies, genres, sizes | Annual "still true?" sweep ~2 weeks before birthday |
| **Living** (continuous) | Wish list, $10-or-less, "won't buy myself", do-not-gift | One-tap prompts year-round |
| **Episodic** (event-scoped) | Secret Santa rules, this year's budget | Lives on the event |

### Visibility defaults

| Field group | Default tier |
|---|---|
| Sizes, gift-card stores, do-not-gift, allergies | Open |
| Categories, hobbies, party style | Open |
| Specific wish-list items | Hint (AI mediates) |
| "Secret wish", "won't buy myself" | Sealed (AI only) |

---

## 4. Algorithm Design

**LLM-as-reasoner + retailer-API-as-catalog + lightweight personalization.** No custom ML model.

### Pipeline (per gift suggestion request)

1. **Giver context.** Recipient, occasion, budget, constraints. 30 seconds of input.
2. **Profile assembly.** Recipient's full profile + Big-Five short-form scores + giver's past gift history to this recipient.
3. **Hard-constraint filter.** Strip do-not-gift categories, age-gated items, allergens, "already owned."
4. **LLM ideation.** Claude generates ~15 gift *concepts* (not products yet). Prompt weights: "won't-buy-myself" > wish list > hobbies > favorites. **Cache the profile prefix** — major cost saver.
5. **Catalog retrieval.** Query Amazon PA-API / Etsy / experience marketplaces for 2–3 real items per concept.
6. **Re-rank.** LLM scores items against profile + personality, returns top 5–8 with one-sentence "why this works for them" rationales.
7. **Feedback capture.** Giver taps "love it / meh / they have it / wrong vibe."

### Why this is realistic and shippable

- No training data needed.
- Personality reasoning is exactly what LLMs are good at.
- Affiliate APIs give actual SKUs and revenue.
- The "rationale" sentence is the magic — makes the giver feel like *they* thought of it.

### Big Five (TIPI) → gift heuristics

- **Openness** ↑ → experiences, art, novel/quirky items
- **Conscientiousness** ↑ → organizers, planners, premium tools
- **Extraversion** ↑ → social/statement items, hosting gear
- **Agreeableness** ↑ → comfort, gifts that involve others
- **Neuroticism** ↑ → calming, self-care, security

### Anti-patterns

- **Don't build a "shop" surface.** PRSNT is not a marketplace. Suggestions link out.
- **Don't show match scores.** Numerical confidence ("87% match!") feels like Tinder, not love.
- **Don't auto-purchase.** The act of choosing IS the gift.

---

## 5. Business / Strategy Gaps

### Competitors

- **Elfster, DrawNames, Giftster** — Secret Santa + wishlist apps. Old, ugly. Easy to beat on design and AI.
- **Amazon Wishlist** — the default. Free, universal. Justify why we're *better than free* — answer: the recipient doesn't have to know what they want.
- **Honeyfund / wedding registries** — adjacent. v3 expansion.
- **Giftly, Wantist** — giver-side only (no recipient profile). Our recipient-data moat is real but only if recipients fill profiles.

Wedge: *"Amazon Wishlist for people who don't want to ruin the surprise."*

### Monetization (priority order)

1. **Affiliate revenue** — Amazon Associates, Etsy, Target, Best Buy. 1–8% on purchase. Bread and butter.
2. **Premium tier** — $3–5/month or $25/year. Unlimited groups, advanced rules, AI-generated cards, concierge recs, calendar integrations, gift-history archive.
3. **Corporate Secret Santa B2B** — $X/employee. Higher ACV.
4. **Sponsored discovery** (later, carefully) — vetted small brands. Quality-gated or it kills trust.

Avoid: selling user data, ads. Product depends on emotional trust.

### Cold start (the real risk)

- Secret Santa as the wedge — single best lever. Brings 8–20 people in at once.
- One-sided utility from day one. Solo user can fill a profile + share a list.
- Birthday calendar from phone contacts (with permission). Nudge: "Sarah's birthday in 12 days — invite her, or get AI suggestions now."
- Gift "thank-you" loop. Recipient reacts to what they received.

### Seasonality

- Year-round occasions baked into the UI: birthdays, anniversaries, Mother's/Father's, Valentine's, graduations, baby showers, "just because."
- "$10 or less" feature is a stealth retention engine.
- Wedding/baby registry adjacency smooths revenue.

### Trust, safety, legal

- **Minors.** COPPA: under-13 needs verifiable parental consent. Under-13 profiles managed *by* a parent.
- **Addresses & shipping.** Never show addresses; offer "ship via Amazon" as opt-in tunnel.
- **Secret Santa fairness.** Constraint solver MUST be auditable. Test tricky cases (couples, prior-year exclusions, 3-person groups).
- **Personality data.** Big Five scores are sensitive psych data. Store with care; offer deletion.
- **GDPR / CCPA.** Data export and deletion flows from day one.

### Other gaps

- Group gifting / chip-in. v2.
- Gift dedup. "Marked as bought" hidden from recipient. Must-have at v1.
- Gift history. Year-over-year archive. Drives "no repeats" guarantee.
- Cultural fit (Diwali, Lunar New Year, Three Kings Day, Eid). Design for global early.
- "I bought this offline" — log non-affiliate gifts so dedup + history still work.

---

## 6. Tech Stack & Phased Roadmap

### Stack

- **Mobile:** React Native + Expo. iOS + Android, one codebase.
- **Backend:** Node.js + Postgres. Hosted on Railway / Fly / Render / Supabase.
- **Auth:** Supabase Auth or Clerk. Apple Sign-In is required for iOS App Store.
- **AI:** Anthropic Claude API for ideation + re-ranking. **Use prompt caching** on the recipient profile.
- **Catalog:** Amazon PA-API (apply early — approval can take weeks), Etsy API.
- **Push:** Expo Push Notifications.
- **Analytics:** PostHog (open-source, includes session replay).

### Phased roadmap

- **v1.0 — Profiles + Secret Santa + Birthdays (target: mid-October).** Shared platform + two event surfaces. Ship to App Store before Halloween.
- **v1.1 — Polish + monetization plumbing (late November).** Affiliate links live. Big Five short-form. $10-or-less surface. Reactions. Premium tier toggle.
- **v2 — New event types (Q1 next year).** Anniversaries, Graduations, "Just Because." Premium features land.
- **v3 — Expansion (Q2+).** Group gifting. Gift history archive. Corporate B2B. Weddings + Baby showers. International.

**Solo-founder scope discipline.** Defer: web app, group gifting, gift history archive, multiple languages, in-app messaging, gift reactions. None of these belong in v1.

---

## 7. Decisions made

- **Architecture:** Profiles is the platform; events are extensions.
- **v1 launch surface:** Profiles + Secret Santa + Birthdays.
- **Platform:** React Native + Expo, iOS + Android.
- **Build mode:** Solo founder + AI tooling. Scope discipline non-negotiable.
- **Brand voice:** Keep the irreverent personality.
- **Codename:** PRSNT until rename lands. See `docs/NAMING.md`.

### Still open

- **Geographic scope.** US-only at launch is fine; flag i18n in v3.
- **Affiliate-program approval lead time.** Apply to Amazon PA-API in week 1.
- **Brand name.** Locked before App Store submission, marketing site, or trademark filing.

---

## 8. Verification

- **Time-to-useful-profile:** Onboarding hits a usable profile in ≤120 seconds.
- **Suggestion quality:** After every AI batch, ask the giver: "would you actually buy any of these?" Aim for ≥50% yes by v2.
- **Secret Santa correctness:** Pre-write unit tests for tricky drawings (couples, prior-year exclusions, 3-person groups). Bug here = product death.
- **D30 retention.** <15% D30 kills non-event apps. Use the calendar/birthday surface to lift it.
