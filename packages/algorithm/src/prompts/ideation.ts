import type { Profile, OccasionContext } from '../types.js';

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

Tone: warm, specific, a little playful. Never generic ("cozy blanket" without anchoring is generic).`;

export function buildIdeationUserMessage(
  profile: Profile,
  occasion: OccasionContext,
  pastGifts: string[] = [],
): string {
  return [
    `# Recipient profile`,
    JSON.stringify(profile, null, 2),
    ``,
    `# Occasion`,
    JSON.stringify(occasion, null, 2),
    ``,
    `# Past gifts (do not repeat)`,
    pastGifts.length ? pastGifts.map((g) => `- ${g}`).join('\n') : '(none)',
    ``,
    `Generate 12-15 gift concepts.`,
  ].join('\n');
}
