export interface Participant {
  id: string;
  displayName: string;
}

export type ConstraintReason =
  | 'spouse'
  | 'parent_child'
  | 'sibling'
  | 'prior_year_match'
  | 'mutual_exclusion'
  | 'self'
  | 'manual';

export interface ExclusionEdge {
  giverId: string;
  recipientId: string;
  reason: ConstraintReason;
}

export interface DrawInput {
  participants: Participant[];
  exclusions: ExclusionEdge[];
  seed?: number;
}

export interface Pairing {
  giverId: string;
  recipientId: string;
}

export type DrawResult =
  | { ok: true; pairings: Pairing[] }
  | { ok: false; reason: 'infeasible'; conflicts: ExclusionEdge[] };
