import type { DrawInput, DrawResult, ExclusionEdge, Pairing } from './types.js';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], rand: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const ai = arr[i] as T;
    const aj = arr[j] as T;
    arr[i] = aj;
    arr[j] = ai;
  }
  return arr;
}

function isExcluded(
  giverId: string,
  recipientId: string,
  exclusions: ExclusionEdge[],
): boolean {
  if (giverId === recipientId) return true;
  return exclusions.some(
    (e) => e.giverId === giverId && e.recipientId === recipientId,
  );
}

export function draw(input: DrawInput): DrawResult {
  const { participants, exclusions, seed = 42 } = input;
  const rand = mulberry32(seed);

  const giverIds = participants.map((p) => p.id);
  const allRecipientIds = new Set(giverIds);

  // Backtracking with randomized recipient ordering for fairness.
  const assignment = new Map<string, string>();
  const used = new Set<string>();

  const orderedGivers = shuffled(giverIds, rand);

  function backtrack(i: number): boolean {
    if (i === orderedGivers.length) return true;
    const giver = orderedGivers[i] as string;
    const candidates = shuffled(
      [...allRecipientIds].filter(
        (r) => !used.has(r) && !isExcluded(giver, r, exclusions),
      ),
      rand,
    );
    for (const recipient of candidates) {
      assignment.set(giver, recipient);
      used.add(recipient);
      if (backtrack(i + 1)) return true;
      assignment.delete(giver);
      used.delete(recipient);
    }
    return false;
  }

  if (!backtrack(0)) {
    return {
      ok: false,
      reason: 'infeasible',
      conflicts: exclusions,
    };
  }

  const pairings: Pairing[] = orderedGivers.map((giverId) => ({
    giverId,
    recipientId: assignment.get(giverId) as string,
  }));

  return { ok: true, pairings };
}
