export type PartyStyle =
  | 'big_party'
  | 'small_party'
  | 'surprise_party'
  | 'big_dinner'
  | 'small_dinner'
  | 'just_family'
  | 'just_friends'
  | 'no_party';

export const PARTY_STYLE_OPTIONS: { value: PartyStyle; label: string }[] = [
  { value: 'big_party', label: 'Big party (crowd)' },
  { value: 'small_party', label: 'Small party (6–7 people)' },
  { value: 'surprise_party', label: 'Surprise party (boo!)' },
  { value: 'big_dinner', label: 'Big dinner (6–7 people)' },
  { value: 'small_dinner', label: 'Small dinner (3–4 people)' },
  { value: 'just_family', label: 'Just family' },
  { value: 'just_friends', label: 'Just friends' },
  { value: 'no_party', label: 'No party (alone in solitude)' },
];

export const GIFT_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'art', label: 'Art' },
  { value: 'board_games', label: 'Board games + puzzles' },
  { value: 'books', label: 'Books' },
  { value: 'beauty', label: 'Beauty supplies' },
  { value: 'cash', label: 'Straight cash, homie' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'food', label: 'Food' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'giftcards', label: 'Gift cards' },
  { value: 'movies', label: 'Movies' },
  { value: 'musical_instruments', label: 'Musical instruments' },
  { value: 'sporting_goods', label: 'Sporting goods' },
  { value: 'tech', label: 'Tech + gadgets' },
  { value: 'tickets', label: 'Tickets' },
];

export interface OnboardingState {
  displayName: string;
  birthdayMonth: string;
  birthdayDay: string;
  birthdayYear: string;
  partyStyle: PartyStyle | null;
  giftCategoriesLiked: string[];
  wontBuySelf: [string, string, string];
}

export const INITIAL_STATE: OnboardingState = {
  displayName: '',
  birthdayMonth: '',
  birthdayDay: '',
  birthdayYear: '',
  partyStyle: null,
  giftCategoriesLiked: [],
  wontBuySelf: ['', '', ''],
};

export type Step =
  | 'name'
  | 'birthday'
  | 'partyStyle'
  | 'categories'
  | 'wontBuySelf'
  | 'submitting'
  | 'done';

export const STEP_ORDER: Step[] = [
  'name',
  'birthday',
  'partyStyle',
  'categories',
  'wontBuySelf',
];

export function pad2(s: string): string {
  return s.padStart(2, '0');
}

export function buildBirthdayIso(state: OnboardingState): string | null {
  const m = parseInt(state.birthdayMonth, 10);
  const d = parseInt(state.birthdayDay, 10);
  const y = parseInt(state.birthdayYear, 10);
  if (Number.isNaN(m) || Number.isNaN(d) || Number.isNaN(y)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;
  return `${y}-${pad2(state.birthdayMonth)}-${pad2(state.birthdayDay)}`;
}

export function isStepValid(step: Step, state: OnboardingState): boolean {
  switch (step) {
    case 'name':
      return state.displayName.trim().length > 0;
    case 'birthday':
      return buildBirthdayIso(state) !== null;
    case 'partyStyle':
      return state.partyStyle !== null;
    case 'categories':
      return (
        state.giftCategoriesLiked.length >= 1 &&
        state.giftCategoriesLiked.length <= 5
      );
    case 'wontBuySelf':
      return state.wontBuySelf.filter((s) => s.trim().length > 0).length >= 1;
    default:
      return true;
  }
}
