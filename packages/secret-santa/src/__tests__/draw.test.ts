import { describe, it, expect } from 'vitest';
import { draw } from '../draw.js';
import type { Participant, ExclusionEdge } from '../types.js';

const people = (n: number): Participant[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    displayName: `Person ${i + 1}`,
  }));

describe('draw', () => {
  it('produces a valid permutation with no constraints', () => {
    const result = draw({ participants: people(5), exclusions: [], seed: 1 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const givers = new Set(result.pairings.map((p) => p.giverId));
    const recipients = new Set(result.pairings.map((p) => p.recipientId));
    expect(givers.size).toBe(5);
    expect(recipients.size).toBe(5);
    for (const { giverId, recipientId } of result.pairings) {
      expect(giverId).not.toBe(recipientId);
    }
  });

  it('respects spouse exclusions (no mutual draws)', () => {
    // p1 and p2 are spouses; p3 and p4 are spouses.
    const exclusions: ExclusionEdge[] = [
      { giverId: 'p1', recipientId: 'p2', reason: 'spouse' },
      { giverId: 'p2', recipientId: 'p1', reason: 'spouse' },
      { giverId: 'p3', recipientId: 'p4', reason: 'spouse' },
      { giverId: 'p4', recipientId: 'p3', reason: 'spouse' },
    ];
    const result = draw({ participants: people(4), exclusions, seed: 7 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const map = new Map(result.pairings.map((p) => [p.giverId, p.recipientId]));
    expect(map.get('p1')).not.toBe('p2');
    expect(map.get('p2')).not.toBe('p1');
    expect(map.get('p3')).not.toBe('p4');
    expect(map.get('p4')).not.toBe('p3');
  });

  it('respects prior-year exclusions (no repeats)', () => {
    const exclusions: ExclusionEdge[] = [
      { giverId: 'p1', recipientId: 'p2', reason: 'prior_year_match' },
      { giverId: 'p2', recipientId: 'p3', reason: 'prior_year_match' },
      { giverId: 'p3', recipientId: 'p1', reason: 'prior_year_match' },
    ];
    const result = draw({ participants: people(3), exclusions, seed: 3 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const map = new Map(result.pairings.map((p) => [p.giverId, p.recipientId]));
    expect(map.get('p1')).not.toBe('p2');
    expect(map.get('p2')).not.toBe('p3');
    expect(map.get('p3')).not.toBe('p1');
  });

  it('detects infeasible draws', () => {
    // Two-person group where they exclude each other = no valid draw.
    const exclusions: ExclusionEdge[] = [
      { giverId: 'p1', recipientId: 'p2', reason: 'mutual_exclusion' },
      { giverId: 'p2', recipientId: 'p1', reason: 'mutual_exclusion' },
    ];
    const result = draw({ participants: people(2), exclusions, seed: 1 });
    expect(result.ok).toBe(false);
  });

  it('is deterministic given the same seed', () => {
    const a = draw({ participants: people(8), exclusions: [], seed: 99 });
    const b = draw({ participants: people(8), exclusions: [], seed: 99 });
    expect(a).toEqual(b);
  });
});
