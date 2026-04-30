import type { Profile, GiftCategory, SuggestionConcept } from './types.js';

const ALCOHOL_CATEGORIES: ReadonlySet<GiftCategory> = new Set(['alcohol']);

export interface FilterContext {
  profile: Profile;
  ageYears?: number;
  pastGifts?: string[];
}

export function filterCategoriesUpfront(
  context: FilterContext,
): { allowed: GiftCategory[]; blocked: GiftCategory[] } {
  const { profile, ageYears } = context;
  const blocked = new Set<GiftCategory>(profile.giftCategoriesDisliked);
  if (ageYears !== undefined && ageYears < 21) {
    for (const c of ALCOHOL_CATEGORIES) blocked.add(c);
  }
  const allowed = profile.giftCategoriesLiked.filter((c) => !blocked.has(c));
  return { allowed, blocked: [...blocked] };
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function matchesAny(haystack: string, needles: readonly string[]): boolean {
  const h = normalize(haystack);
  return needles.some((n) => h.includes(normalize(n)));
}

export function rejectConcept(
  concept: SuggestionConcept,
  context: FilterContext,
): { rejected: false } | { rejected: true; reason: string } {
  const { profile, pastGifts = [] } = context;

  if (profile.giftCategoriesDisliked.includes(concept.category)) {
    return { rejected: true, reason: 'category_disliked' };
  }

  const blob = `${concept.title} ${concept.searchQuery}`;
  if (profile.doNotGift.length && matchesAny(blob, profile.doNotGift)) {
    return { rejected: true, reason: 'do_not_gift_match' };
  }
  if (pastGifts.length && matchesAny(blob, pastGifts)) {
    return { rejected: true, reason: 'past_gift_repeat' };
  }
  return { rejected: false };
}

export function filterConcepts(
  concepts: SuggestionConcept[],
  context: FilterContext,
): SuggestionConcept[] {
  return concepts.filter((c) => !rejectConcept(c, context).rejected);
}
