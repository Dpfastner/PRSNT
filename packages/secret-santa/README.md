# @prsnt/secret-santa

Constraint-aware Secret Santa draw.

## Why this package exists

Bugs in pairing logic destroy trust at the worst possible moment (the reveal). Per `docs/STRATEGY.md` §5: "the constraint solver MUST be auditable." This package isolates the draw so it can be reasoned about and tested in isolation.

## Constraint types

- `spouse` — partners shouldn't draw each other
- `parent_child` — immediate family exclusion
- `sibling` — sibling exclusion
- `prior_year_match` — prevents repeats year-over-year
- `mutual_exclusion` — A draws B implies B doesn't draw A
- `self` — implicit, always enforced
- `manual` — organizer override

## API

```ts
import { draw } from '@prsnt/secret-santa';

const result = draw({
  participants: [{ id: 'p1', displayName: 'Alice' }, ...],
  exclusions: [{ giverId: 'p1', recipientId: 'p2', reason: 'spouse' }, ...],
  seed: 42,
});

if (result.ok) {
  for (const { giverId, recipientId } of result.pairings) { ... }
} else {
  // result.reason === 'infeasible' — surface the conflicts to the organizer.
}
```

Deterministic given a seed (useful for testing + audit logs).
