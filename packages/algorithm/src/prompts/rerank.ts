import type {
  Profile,
  OccasionContext,
  SuggestionConcept,
  CatalogItem,
} from '../types.js';

export const RERANK_SYSTEM_PROMPT = `You score gift concepts (with optional concrete catalog items) against a recipient's profile and occasion.

Output a JSON array, one entry per concept, ordered best-fit first. Include for each:
- concept: echo the input concept verbatim
- score: number 0-100 (NEVER shown to the user; for ranking only)
- whyThisWorks: a single warm sentence the giver will read. Reference a specific signal in the profile. Avoid generic phrases.
- chosenItem: if catalog items were provided, pick the single best match. Otherwise null.

Return ONLY valid JSON. No prose. No markdown fences.`;

export function buildRerankUserMessage(
  occasion: OccasionContext,
  conceptsWithItems: { concept: SuggestionConcept; items: CatalogItem[] }[],
): string {
  return [
    `# Occasion`,
    JSON.stringify(occasion, null, 2),
    ``,
    `# Concepts to rank`,
    JSON.stringify(conceptsWithItems, null, 2),
    ``,
    `Return the ranked JSON array.`,
  ].join('\n');
}

/**
 * Profile prefix is identical to the ideation step, so the cache hits twice.
 */
export { buildProfilePrefix } from './ideation.js';
