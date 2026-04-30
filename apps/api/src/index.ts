import Fastify from 'fastify';
import { createDatabase } from './db/client.js';

const app = Fastify({ logger: true });

const databaseUrl = process.env.DATABASE_URL;
const db = databaseUrl ? createDatabase(databaseUrl) : null;

app.get('/health', async () => ({
  ok: true,
  service: 'prsnt-api',
  db: db ? 'configured' : 'not_configured',
}));

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
