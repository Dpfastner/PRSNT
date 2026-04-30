import {
  buildBirthdayIso,
  INITIAL_STATE,
  isStepValid,
} from '../types';

describe('buildBirthdayIso', () => {
  it('zero-pads single-digit month and day', () => {
    expect(
      buildBirthdayIso({
        ...INITIAL_STATE,
        birthdayMonth: '6',
        birthdayDay: '7',
        birthdayYear: '1990',
      }),
    ).toBe('1990-06-07');
  });

  it('returns null for invalid month', () => {
    expect(
      buildBirthdayIso({
        ...INITIAL_STATE,
        birthdayMonth: '13',
        birthdayDay: '1',
        birthdayYear: '1990',
      }),
    ).toBeNull();
  });

  it('returns null when fields are blank', () => {
    expect(buildBirthdayIso(INITIAL_STATE)).toBeNull();
  });
});

describe('isStepValid', () => {
  it('name requires a non-empty string', () => {
    expect(isStepValid('name', INITIAL_STATE)).toBe(false);
    expect(
      isStepValid('name', { ...INITIAL_STATE, displayName: 'Test' }),
    ).toBe(true);
  });

  it('birthday requires a parseable date', () => {
    expect(isStepValid('birthday', INITIAL_STATE)).toBe(false);
    expect(
      isStepValid('birthday', {
        ...INITIAL_STATE,
        birthdayMonth: '01',
        birthdayDay: '15',
        birthdayYear: '1990',
      }),
    ).toBe(true);
  });

  it('categories require 1-5 entries', () => {
    expect(isStepValid('categories', INITIAL_STATE)).toBe(false);
    expect(
      isStepValid('categories', {
        ...INITIAL_STATE,
        giftCategoriesLiked: ['books'],
      }),
    ).toBe(true);
    expect(
      isStepValid('categories', {
        ...INITIAL_STATE,
        giftCategoriesLiked: ['a', 'b', 'c', 'd', 'e', 'f'],
      }),
    ).toBe(false);
  });

  it('wontBuySelf requires at least one non-empty entry', () => {
    expect(isStepValid('wontBuySelf', INITIAL_STATE)).toBe(false);
    expect(
      isStepValid('wontBuySelf', {
        ...INITIAL_STATE,
        wontBuySelf: ['', '  ', 'fancy candles'],
      }),
    ).toBe(true);
  });
});
