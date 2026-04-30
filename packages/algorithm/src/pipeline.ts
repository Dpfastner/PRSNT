import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type {
  Profile,
  OccasionContext,
  SuggestionConcept,
  CatalogItem,
  RankedSuggestion,
  GiftCategory,
} from './types.js';
import { filterConcepts } from './filters.js';
import {
  IDEATION_SYSTEM_PROMPT,
  VALID_CATEGORIES,
  buildProfilePrefix,
  buildOccasionMessage,
} from './prompts/ideation.js';
import {
  RERANK_SYSTEM_PROMPT,
  buildRerankUserMessage,
} from './prompts/rerank.js';
import { NoopCatalogProvider, type CatalogProvider } from './catalog.js';

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 2048;

const CategoryEnum = z.enum(VALID_CATEGORIES as [GiftCategory, ...GiftCategory[]]);

const ConceptSchema = z.object({
  title: z.string().min(1),
  rationale: z.string().min(1),
  category: CategoryEnum,
  searchQuery: z.string().min(1),
});

const IdeationResponseSchema = z.object({
  concepts: z.array(ConceptSchema).min(1),
});

const RerankEntrySchema = z.object({
  concept: ConceptSchema,
  score: z.number().min(0).max(100),
  whyThisWorks: z.string().min(1),
  chosenItem: z
    .object({
      source: z.enum(['amazon', 'etsy', 'experience', 'manual']),
      title: z.string(),
      priceUsd: z.number(),
      productUrl: z.string(),
      imageUrl: z.string().optional(),
      sku: z.string().optional(),
    })
    .nullable()
    .optional(),
});

const RerankResponseSchema = z.array(RerankEntrySchema);

export interface ClaudePipelineOptions {
  client: Anthropic;
  model?: string;
  catalog?: CatalogProvider;
  maxTokens?: number;
}

export interface SuggestArgs {
  profile: Profile;
  occasion: OccasionContext;
  pastGifts?: string[];
  ageYears?: number;
}

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

function parseJson<T>(text: string, schema: z.ZodType<T>, label: string): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `[${label}] Claude response was not valid JSON: ${(err as Error).message}\n---\n${text}`,
    );
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `[${label}] Claude response failed schema validation: ${result.error.message}\n---\n${text}`,
    );
  }
  return result.data;
}

export class ClaudePipeline {
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly catalog: CatalogProvider;
  private readonly maxTokens: number;

  constructor(opts: ClaudePipelineOptions) {
    this.client = opts.client;
    this.model = opts.model ?? DEFAULT_MODEL;
    this.catalog = opts.catalog ?? new NoopCatalogProvider();
    this.maxTokens = opts.maxTokens ?? DEFAULT_MAX_TOKENS;
  }

  async suggest(args: SuggestArgs): Promise<RankedSuggestion[]> {
    const concepts = await this.ideate(args);
    const filtered = filterConcepts(concepts, {
      profile: args.profile,
      ageYears: args.ageYears,
      pastGifts: args.pastGifts,
    });
    if (filtered.length === 0) return [];

    const conceptsWithItems = await this.attachCatalogItems(
      filtered,
      args.occasion.budgetUsd,
    );
    return this.rerank(args, conceptsWithItems);
  }

  async ideate(args: SuggestArgs): Promise<SuggestionConcept[]> {
    const profilePrefix = buildProfilePrefix(args.profile);
    const occasionMessage = buildOccasionMessage(
      args.occasion,
      args.pastGifts,
    );

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: [
        {
          type: 'text',
          text: IDEATION_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: profilePrefix,
              cache_control: { type: 'ephemeral' },
            },
            {
              type: 'text',
              text: occasionMessage,
            },
          ],
        },
      ],
    });

    const text = extractText(response);
    const parsed = parseJson(text, IdeationResponseSchema, 'ideation');
    return parsed.concepts;
  }

  private async attachCatalogItems(
    concepts: SuggestionConcept[],
    budgetUsd: { min: number; max: number },
  ): Promise<{ concept: SuggestionConcept; items: CatalogItem[] }[]> {
    return Promise.all(
      concepts.map(async (concept) => {
        const items = await this.catalog.search({
          concept,
          budgetUsd,
          limit: 3,
        });
        return { concept, items };
      }),
    );
  }

  async rerank(
    args: SuggestArgs,
    conceptsWithItems: { concept: SuggestionConcept; items: CatalogItem[] }[],
  ): Promise<RankedSuggestion[]> {
    const profilePrefix = buildProfilePrefix(args.profile);
    const userMessage = buildRerankUserMessage(
      args.occasion,
      conceptsWithItems,
    );

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: [
        {
          type: 'text',
          text: RERANK_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: profilePrefix,
              cache_control: { type: 'ephemeral' },
            },
            {
              type: 'text',
              text: userMessage,
            },
          ],
        },
      ],
    });

    const text = extractText(response);
    const parsed = parseJson(text, RerankResponseSchema, 'rerank');

    const itemsByConceptTitle = new Map(
      conceptsWithItems.map((c) => [c.concept.title, c.items]),
    );

    return parsed
      .slice()
      .sort((a, b) => b.score - a.score)
      .map((entry): RankedSuggestion => {
        const items = itemsByConceptTitle.get(entry.concept.title) ?? [];
        return {
          concept: entry.concept,
          items,
          score: entry.score,
          whyThisWorks: entry.whyThisWorks,
        };
      });
  }
}
