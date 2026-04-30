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
  VALID_CATEGORIES,
  buildProfilePrefix,
  buildOccasionMessage,
} from './prompts/ideation.js';

export {
  RERANK_SYSTEM_PROMPT,
  buildRerankUserMessage,
} from './prompts/rerank.js';

export {
  filterCategoriesUpfront,
  filterConcepts,
  rejectConcept,
  type FilterContext,
} from './filters.js';

export {
  NoopCatalogProvider,
  type CatalogProvider,
} from './catalog.js';

export {
  ClaudePipeline,
  type ClaudePipelineOptions,
  type SuggestArgs,
} from './pipeline.js';

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
    ageYears?: number;
  }): Promise<RankedSuggestion[]>;
}
