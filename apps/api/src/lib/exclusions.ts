import type { ExclusionEdge } from '@prsnt/secret-santa';

type RelationshipRow = {
  fromUserId: string;
  toUserId: string;
  type:
    | 'spouse'
    | 'parent'
    | 'child'
    | 'sibling'
    | 'friend'
    | 'coworker'
    | 'manual_exclude';
};

type PriorPairingRow = {
  giverUserId: string;
  recipientUserId: string;
};

const EXCLUDED_RELATIONSHIP_TYPES: ReadonlySet<RelationshipRow['type']> = new Set([
  'spouse',
  'parent',
  'child',
  'sibling',
  'manual_exclude',
]);

function reasonFor(type: RelationshipRow['type']): ExclusionEdge['reason'] | null {
  if (type === 'spouse') return 'spouse';
  if (type === 'parent' || type === 'child') return 'parent_child';
  if (type === 'sibling') return 'sibling';
  if (type === 'manual_exclude') return 'manual';
  return null;
}

/**
 * Build the ExclusionEdge[] the draw function expects from raw DB rows.
 *
 * Family relationships are made bidirectional (spouse A→B implies B→A can't
 * draw A either). Prior-year matches add directional exclusions only — A
 * giving to B last year doesn't prevent B from giving to A this year.
 */
export function buildExclusions(
  relationships: RelationshipRow[],
  priorPairings: PriorPairingRow[],
): ExclusionEdge[] {
  const edges: ExclusionEdge[] = [];

  for (const rel of relationships) {
    if (!EXCLUDED_RELATIONSHIP_TYPES.has(rel.type)) continue;
    const reason = reasonFor(rel.type);
    if (!reason) continue;
    edges.push({
      giverId: rel.fromUserId,
      recipientId: rel.toUserId,
      reason,
    });
    edges.push({
      giverId: rel.toUserId,
      recipientId: rel.fromUserId,
      reason,
    });
  }

  for (const p of priorPairings) {
    edges.push({
      giverId: p.giverUserId,
      recipientId: p.recipientUserId,
      reason: 'prior_year_match',
    });
  }

  return edges;
}
