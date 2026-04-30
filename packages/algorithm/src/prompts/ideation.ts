import type { Profile, OccasionContext, GiftCategory } from '../types.js';

export const IDEATION_SYSTEM_PROMPT = `You generate gift ideas for someone based on their profile and an occasion context.

Weight signals in this order, highest first:
1. "Won't buy myself" items — these are the gold standard for a great gift.
2. Wish list items — they explicitly want these.
3. Hobbies + interests — gives shape to ideas.
4. Favorites (color, food, etc.) — fine-tune accents and flavors.

Hard constraints (never violate):
- Skip anything in the "do not gift" list.
- Skip anything they already own.
- Respect the budget exactly.
- Respect age gating (alcohol only if 21+).

Output 12-15 gift CONCEPTS, not specific products. A concept is a category + a phrase that a shopper could search for. Each concept includes a one-sentence rationale tied to a specific signal in the profile.

Tone: warm, specific, a little playful. Never generic ("cozy blanket" without anchoring is generic).

Return ONLY valid JSON matching this schema:
{
  "concepts": [
    {
      "title": "string (5-8 words, the gift idea in plain language)",
      "rationale": "string (one sentence, references a specific profile signal)",
      "category": "alcohol|art|board_games|books|beauty|cash|clothing|cooking|experiences|food|gardening|giftcards|movies|musical_instruments|sporting_goods|tech|tickets",
      "searchQuery": "string (3-6 words, optimized for retailer search)"
    }
  ]
}

No prose before or after the JSON. No markdown code fences.`;

export const VALID_CATEGORIES: ReadonlyArray<GiftCategory> = [
  'alcohol',
  'art',
  'board_games',
  'books',
  'beauty',
  'cash',
  'clothing',
  'cooking',
  'experiences',
  'food',
  'gardening',
  'giftcards',
  'movies',
  'musical_instruments',
  'sporting_goods',
  'tech',
  'tickets',
];

/**
 * The profile is the cacheable prefix — it doesn't change between requests
 * for the same recipient, so we send it as a separate cached message block.
 */
export function buildProfilePrefix(profile: Profile): string {
  return [
    `# Recipient profile`,
    JSON.stringify(profile, null, 2),
  ].join('\n');
}

/**
 * Occasion + past-gifts vary per request, so they're NOT cached.
 */
export function buildOccasionMessage(
  occasion: OccasionContext,
  pastGifts: string[] = [],
): string {
  return [
    `# Occasion`,
    JSON.stringify(occasion, null, 2),
    ``,
    `# Past gifts (do not repeat)`,
    pastGifts.length ? pastGifts.map((g) => `- ${g}`).join('\n') : '(none)',
    ``,
    `Generate 12-15 gift concepts as JSON.`,
  ].join('\n');
}
