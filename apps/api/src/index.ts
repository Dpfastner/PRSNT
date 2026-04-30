import Fastify from 'fastify';
import { createDatabase } from './db/client.js';
import { registerEventRoutes } from './routes/events.js';
import { registerOnboardingRoutes } from './routes/onboarding.js';
import {
  createPipelineFromEnv,
  registerSuggestionRoutes,
} from './routes/suggestions.js';

const app = Fastify({ logger: true });

const databaseUrl = process.env.DATABASE_URL;
const db = databaseUrl ? createDatabase(databaseUrl) : null;
const pipeline = createPipelineFromEnv();

app.get('/health', async () => ({
  ok: true,
  service: 'prsnt-api',
  db: db ? 'configured' : 'not_configured',
  pipeline: pipeline ? 'configured' : 'not_configured',
}));

if (db) {
  registerOnboardingRoutes(app, db);
  registerEventRoutes(app, db);
  if (pipeline) {
    registerSuggestionRoutes(app, db, pipeline);
  } else {
    app.log.warn('ANTHROPIC_API_KEY not set; /suggestions disabled');
  }
} else {
  app.log.warn('DATABASE_URL not set; /onboarding, /events, /suggestions disabled');
}

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
