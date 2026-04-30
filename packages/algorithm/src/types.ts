export type GiftCategory =
  | 'alcohol'
  | 'art'
  | 'board_games'
  | 'books'
  | 'beauty'
  | 'cash'
  | 'clothing'
  | 'cooking'
  | 'experiences'
  | 'food'
  | 'gardening'
  | 'giftcards'
  | 'movies'
  | 'musical_instruments'
  | 'sporting_goods'
  | 'tech'
  | 'tickets';

export type EventType =
  | 'secret_santa'
  | 'birthday'
  | 'anniversary'
  | 'graduation'
  | 'wedding'
  | 'baby_shower'
  | 'corporate'
  | 'just_because';

export type VisibilityTier = 'open' | 'hint' | 'sealed';

export interface BigFive {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface Profile {
  userId: string;
  displayName: string;
  birthday: string | null;
  partyStyle?: string;
  favoriteColor?: string;
  giftCategoriesLiked: GiftCategory[];
  giftCategoriesDisliked: GiftCategory[];
  hobbies: string[];
  wontBuySelf: string[];
  underTenItems: string[];
  wishList: string[];
  giftCardStores: string[];
  secretWish?: string;
  sizes: Partial<Record<'shirt' | 'sweatshirt' | 'pants' | 'shoe', string>>;
  doNotGift: string[];
  bigFive?: BigFive;
}

export interface OccasionContext {
  type: EventType;
  budgetUsd: { min: number; max: number };
  deadline?: string;
  notes?: string;
  giverRelationshipToRecipient?: string;
}

export interface SuggestionConcept {
  title: string;
  rationale: string;
  category: GiftCategory;
  searchQuery: string;
}

export interface CatalogItem {
  source: 'amazon' | 'etsy' | 'experience' | 'manual';
  title: string;
  priceUsd: number;
  imageUrl?: string;
  productUrl: string;
  sku?: string;
}

export interface RankedSuggestion {
  concept: SuggestionConcept;
  items: CatalogItem[];
  score: number;
  whyThisWorks: string;
}
