export type {
  Profile,
  OccasionContext,
  SuggestionConcept,
  CatalogItem,
  RankedSuggestion,
  GiftCategory,
  EventType,
  VisibilityTier,
  BigFive,
} from './types.js';

export {
  IDEATION_SYSTEM_PROMPT,
  buildIdeationUserMessage,
} from './prompts/ideation.js';

import type {
  Profile,
  OccasionContext,
  RankedSuggestion,
} from './types.js';

export interface SuggestionPipeline {
  suggest(args: {
    profile: Profile;
    occasion: OccasionContext;
    pastGifts?: string[];
  }): Promise<RankedSuggestion[]>;
}
