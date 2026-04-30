import { describe, it, expect } from 'vitest';
import {
  toAlgorithmProfile,
  ageYearsFromBirthday,
} from '../profile-mapper.js';

const baseRow = {
  userId: 'u1',
  birthday: '1990-06-15',
  partyStyle: null,
  favoriteColor: null,
  giftCategoriesLiked: ['books', 'tech', 'unknown_category'],
  giftCategoriesDisliked: ['beauty'],
  hobbies: ['gardening'],
  wontBuySelf: ['fountain pen'],
  underTenItems: [],
  wishList: [],
  giftCardStores: [],
  secretWish: null,
  sizes: { shirt: 'L' },
  doNotGift: ['cilantro'],
  bigFive: null,
};

describe('toAlgorithmProfile', () => {
  it('drops categories not in the algorithm enum', () => {
    const profile = toAlgorithmProfile(baseRow, 'Test');
    expect(profile.giftCategoriesLiked).toEqual(['books', 'tech']);
  });

  it('coerces null fields to undefined', () => {
    const profile = toAlgorithmProfile(baseRow, 'Test');
    expect(profile.partyStyle).toBeUndefined();
    expect(profile.secretWish).toBeUndefined();
    expect(profile.bigFive).toBeUndefined();
  });

  it('passes through string arrays and jsonb sizes intact', () => {
    const profile = toAlgorithmProfile(baseRow, 'Test');
    expect(profile.hobbies).toEqual(['gardening']);
    expect(profile.sizes).toEqual({ shirt: 'L' });
    expect(profile.doNotGift).toEqual(['cilantro']);
  });
});

describe('ageYearsFromBirthday', () => {
  it('returns undefined for null', () => {
    expect(ageYearsFromBirthday(null)).toBeUndefined();
  });

  it('returns undefined for an invalid date', () => {
    expect(ageYearsFromBirthday('not-a-date')).toBeUndefined();
  });

  it('returns a positive integer for a real birthday', () => {
    const age = ageYearsFromBirthday('1990-01-01');
    expect(age).toBeGreaterThan(30);
    expect(Number.isInteger(age)).toBe(true);
  });
});
