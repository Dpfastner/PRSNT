import { describe, it, expect } from 'vitest';
import {
  filterCategoriesUpfront,
  filterConcepts,
  rejectConcept,
} from '../filters.js';
import type { Profile, SuggestionConcept } from '../types.js';

const baseProfile: Profile = {
  userId: 'u1',
  displayName: 'Test',
  birthday: '1990-01-01',
  giftCategoriesLiked: ['books', 'tech', 'alcohol'],
  giftCategoriesDisliked: ['beauty'],
  hobbies: [],
  wontBuySelf: [],
  underTenItems: [],
  wishList: [],
  giftCardStores: [],
  sizes: {},
  doNotGift: [],
};

const concept = (over: Partial<SuggestionConcept>): SuggestionConcept => ({
  title: 'Nice fountain pen',
  rationale: 'Anchored to journaling hobby.',
  category: 'tech',
  searchQuery: 'fountain pen',
  ...over,
});

describe('filterCategoriesUpfront', () => {
  it('blocks disliked categories', () => {
    const { allowed, blocked } = filterCategoriesUpfront({
      profile: baseProfile,
    });
    expect(allowed).not.toContain('beauty');
    expect(blocked).toContain('beauty');
  });

  it('blocks alcohol when under 21', () => {
    const { allowed, blocked } = filterCategoriesUpfront({
      profile: baseProfile,
      ageYears: 18,
    });
    expect(allowed).not.toContain('alcohol');
    expect(blocked).toContain('alcohol');
  });

  it('allows alcohol when 21+', () => {
    const { allowed } = filterCategoriesUpfront({
      profile: baseProfile,
      ageYears: 30,
    });
    expect(allowed).toContain('alcohol');
  });
});

describe('rejectConcept', () => {
  it('rejects disliked categories', () => {
    const result = rejectConcept(concept({ category: 'beauty' }), {
      profile: baseProfile,
    });
    expect(result.rejected).toBe(true);
  });

  it('rejects do-not-gift matches', () => {
    const profile = { ...baseProfile, doNotGift: ['cilantro', 'leather'] };
    const result = rejectConcept(
      concept({ title: 'Vintage leather wallet' }),
      { profile },
    );
    expect(result.rejected).toBe(true);
  });

  it('rejects past-gift repeats', () => {
    const result = rejectConcept(concept({ title: 'Nice fountain pen' }), {
      profile: baseProfile,
      pastGifts: ['fountain pen'],
    });
    expect(result.rejected).toBe(true);
  });

  it('accepts otherwise-fine concepts', () => {
    const result = rejectConcept(concept({}), { profile: baseProfile });
    expect(result.rejected).toBe(false);
  });
});

describe('filterConcepts', () => {
  it('filters out rejected entries and keeps the rest', () => {
    const concepts = [
      concept({ title: 'A', category: 'beauty' }),
      concept({ title: 'B', category: 'books' }),
      concept({ title: 'Vintage leather bag', category: 'clothing' }),
    ];
    const profile = { ...baseProfile, doNotGift: ['leather'] };
    const out = filterConcepts(concepts, { profile });
    expect(out.map((c) => c.title)).toEqual(['B']);
  });
});
