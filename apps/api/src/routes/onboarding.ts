import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { VALID_CATEGORIES } from '@prsnt/algorithm';
import type { Database } from '../db/client.js';
import { users, profiles } from '../db/schema.js';

const PARTY_STYLES = [
  'big_party',
  'small_party',
  'surprise_party',
  'big_dinner',
  'small_dinner',
  'just_family',
  'just_friends',
  'no_party',
] as const;

const CategoryEnum = z.enum(VALID_CATEGORIES as [string, ...string[]]);

const BodySchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD'),
  partyStyle: z.enum(PARTY_STYLES),
  giftCategoriesLiked: z.array(CategoryEnum).min(1).max(5),
  wontBuySelf: z.array(z.string().trim().min(1)).min(1).max(5),
  email: z.string().email().optional(),
});

export function registerOnboardingRoutes(app: FastifyInstance, db: Database) {
  app.post('/onboarding', async (request, reply) => {
    const body = BodySchema.parse(request.body);

    // Until auth lands, mint a synthetic email so the unique constraint is
    // satisfied. Real signup will replace this with the auth provider's user.
    const email =
      body.email ??
      `test-${crypto.randomUUID()}@prsnt.local`;

    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email, displayName: body.displayName })
        .returning({ id: users.id });
      if (!user) throw new Error('failed to create user');

      const [profile] = await tx
        .insert(profiles)
        .values({
          userId: user.id,
          birthday: body.birthday,
          partyStyle: body.partyStyle,
          giftCategoriesLiked: body.giftCategoriesLiked,
          wontBuySelf: body.wontBuySelf,
        })
        .returning({ id: profiles.id });
      if (!profile) throw new Error('failed to create profile');

      return { userId: user.id, profileId: profile.id };
    });

    return reply.code(201).send(result);
  });
}
