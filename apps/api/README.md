# @prsnt/api

Fastify + Postgres backend.

## Run

```bash
cp .env.example .env  # fill in DATABASE_URL and ANTHROPIC_API_KEY
pnpm dev
```

Health check: `GET /health`.

## Scope (v1)

- Auth (Apple, Google, email)
- Profiles + groups + relationships
- Events (Secret Santa, Birthday)
- Suggestion endpoint that calls `@prsnt/algorithm`
- Secret Santa draw endpoint that calls `@prsnt/secret-santa`
