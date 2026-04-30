# @prsnt/algorithm

Profile + occasion → ranked gift suggestions.

## Pipeline

1. Hard-constraint filter (do-not-gift, age, allergens, already-owned).
2. LLM ideation — Claude generates ~12-15 gift concepts. Profile prefix is prompt-cached.
3. Catalog retrieval — concepts → real items via Amazon PA-API / Etsy / experience marketplaces.
4. LLM re-rank — final list with one-sentence "why this works for them" rationales.

See `docs/STRATEGY.md` §4 for full pipeline.

## Structure

- `src/types.ts` — Profile, OccasionContext, SuggestionConcept, CatalogItem, RankedSuggestion
- `src/prompts/ideation.ts` — system prompt + user-message builder
- `src/index.ts` — public API
