import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';
import {
  ClaudePipeline,
  type SuggestionPipeline,
  type OccasionContext,
} from '@prsnt/algorithm';
import type { Database } from '../db/client.js';
import { events, profiles, users, gifts } from '../db/schema.js';
import {
  toAlgorithmProfile,
  ageYearsFromBirthday,
} from '../lib/profile-mapper.js';
import { suggestions as suggestionsTable } from '../db/schema.js';

const BodySchema = z.object({
  giverId: z.string().uuid(),
  recipientId: z.string().uuid(),
  eventId: z.string().uuid(),
});

export function registerSuggestionRoutes(
  app: FastifyInstance,
  db: Database,
  pipeline: SuggestionPipeline,
) {
  app.post('/suggestions', async (request, reply) => {
    const { giverId, recipientId, eventId } = BodySchema.parse(request.body);

    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });
    if (!event) return reply.code(404).send({ error: 'event_not_found' });

    const recipientRow = await db
      .select({
        userId: profiles.userId,
        displayName: users.displayName,
        birthday: profiles.birthday,
        partyStyle: profiles.partyStyle,
        favoriteColor: profiles.favoriteColor,
        giftCategoriesLiked: profiles.giftCategoriesLiked,
        giftCategoriesDisliked: profiles.giftCategoriesDisliked,
        hobbies: profiles.hobbies,
        wontBuySelf: profiles.wontBuySelf,
        underTenItems: profiles.underTenItems,
        wishList: profiles.wishList,
        giftCardStores: profiles.giftCardStores,
        secretWish: profiles.secretWish,
        sizes: profiles.sizes,
        doNotGift: profiles.doNotGift,
        bigFive: profiles.bigFive,
      })
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.userId, recipientId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!recipientRow) {
      return reply.code(404).send({ error: 'recipient_profile_not_found' });
    }

    const algoProfile = toAlgorithmProfile(recipientRow, recipientRow.displayName);
    const ageYears = ageYearsFromBirthday(recipientRow.birthday);

    const pastGiftRows = await db
      .select({ title: gifts.title })
      .from(gifts)
      .where(eq(gifts.recipientUserId, recipientId));
    const pastGifts = pastGiftRows.map((g) => g.title);

    const occasion: OccasionContext = {
      type: event.type,
      budgetUsd: {
        min: event.budgetMinUsd ?? 25,
        max: event.budgetMaxUsd ?? 100,
      },
      deadline: event.startsAt?.toISOString(),
      notes: event.occasionContext ?? undefined,
    };

    const ranked = await pipeline.suggest({
      profile: algoProfile,
      occasion,
      pastGifts,
      ageYears,
    });

    const [persisted] = await db
      .insert(suggestionsTable)
      .values({
        eventId,
        giverUserId: giverId,
        recipientUserId: recipientId,
        ranked,
      })
      .returning({ id: suggestionsTable.id, createdAt: suggestionsTable.createdAt });

    return reply.send({
      ok: true,
      id: persisted?.id,
      createdAt: persisted?.createdAt,
      ranked,
    });
  });
}

export function createPipelineFromEnv(): SuggestionPipeline | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const client = new Anthropic({ apiKey });
  return new ClaudePipeline({ client });
}
