import { describe, it, expect } from 'vitest';
import { buildExclusions } from '../exclusions.js';

describe('buildExclusions', () => {
  it('makes spouse exclusions bidirectional', () => {
    const edges = buildExclusions(
      [{ fromUserId: 'a', toUserId: 'b', type: 'spouse' }],
      [],
    );
    expect(edges).toContainEqual({
      giverId: 'a',
      recipientId: 'b',
      reason: 'spouse',
    });
    expect(edges).toContainEqual({
      giverId: 'b',
      recipientId: 'a',
      reason: 'spouse',
    });
  });

  it('maps parent and child to a single parent_child reason', () => {
    const edges = buildExclusions(
      [{ fromUserId: 'p', toUserId: 'c', type: 'parent' }],
      [],
    );
    expect(edges.every((e) => e.reason === 'parent_child')).toBe(true);
    expect(edges).toHaveLength(2);
  });

  it('ignores friend and coworker relationships', () => {
    const edges = buildExclusions(
      [
        { fromUserId: 'a', toUserId: 'b', type: 'friend' },
        { fromUserId: 'a', toUserId: 'c', type: 'coworker' },
      ],
      [],
    );
    expect(edges).toEqual([]);
  });

  it('adds prior-year matches as directional exclusions', () => {
    const edges = buildExclusions(
      [],
      [{ giverUserId: 'a', recipientUserId: 'b' }],
    );
    expect(edges).toEqual([
      { giverId: 'a', recipientId: 'b', reason: 'prior_year_match' },
    ]);
  });

  it('respects manual_exclude in both directions', () => {
    const edges = buildExclusions(
      [{ fromUserId: 'a', toUserId: 'b', type: 'manual_exclude' }],
      [],
    );
    expect(edges).toHaveLength(2);
    expect(edges.every((e) => e.reason === 'manual')).toBe(true);
  });
});
