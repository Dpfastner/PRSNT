# @prsnt/api

Fastify + Postgres + Drizzle backend.

## Run

```bash
cp .env.example .env  # fill in DATABASE_URL and ANTHROPIC_API_KEY
pnpm dev              # tsx watch mode on src/index.ts
```

Health check: `GET /health` returns `{ ok, service, db: 'configured' | 'not_configured' }`.

## Database

Drizzle ORM, schema in `src/db/schema.ts`. Migration files committed to `src/db/migrations/`.

```bash
pnpm db:generate   # diff schema.ts vs migrations/, write a new SQL file
pnpm db:migrate    # apply pending migrations to DATABASE_URL
pnpm db:push       # dev-only: sync schema directly without a migration file
pnpm db:studio     # browser-based DB explorer
```

Schema tables (see `docs/STRATEGY.md` §3 for the data model):

- `users` — identity + auth
- `profiles` — preferences + personality (one per user, versioned)
- `groups` + `group_memberships` — persistent collections of users
- `relationships` — directed edges (spouse, parent, child, sibling, friend, coworker, manual_exclude); drives Secret Santa exclusions
- `events` + `event_participants` — first-class event objects (Secret Santa, birthday, anniversary, etc.)
- `event_pairings` — Secret Santa draw results (giver → recipient + seed for audit)
- `suggestions` — AI-generated ranked gift ideas per (giver, recipient, event)
- `gifts` — actual gifts given (drives dedup, history, no-repeat exclusions next year)

## Scope (v1)

- Auth (Apple, Google, email)
- Profiles + groups + relationships
- Events (Secret Santa, Birthday)
- `POST /events/:id/draw` calling `@prsnt/secret-santa`
- `POST /suggestions` calling `@prsnt/algorithm`
