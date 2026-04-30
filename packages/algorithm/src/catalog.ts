import type { CatalogItem, SuggestionConcept } from './types.js';

export interface CatalogProvider {
  search(args: {
    concept: SuggestionConcept;
    budgetUsd: { min: number; max: number };
    limit?: number;
  }): Promise<CatalogItem[]>;
}

/**
 * Returns nothing — useful for v0 (concepts-only) and tests.
 * Replace with Amazon PA-API / Etsy adapter in v1.1.
 */
export class NoopCatalogProvider implements CatalogProvider {
  async search(): Promise<CatalogItem[]> {
    return [];
  }
}
