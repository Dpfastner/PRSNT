import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and, inArray } from 'drizzle-orm';
import { draw } from '@prsnt/secret-santa';
import type { Database } from '../db/client.js';
import {
  events,
  eventParticipants,
  eventPairings,
  relationships,
} from '../db/schema.js';
import { buildExclusions } from '../lib/exclusions.js';

const ParamsSchema = z.object({ id: z.string().uuid() });
const BodySchema = z.object({ force: z.boolean().optional() });

export function registerEventRoutes(app: FastifyInstance, db: Database) {
  app.post('/events/:id/draw', async (request, reply) => {
    const { id: eventId } = ParamsSchema.parse(request.params);
    const { force } = BodySchema.parse(request.body ?? {});

    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });
    if (!event) return reply.code(404).send({ error: 'event_not_found' });
    if (event.type !== 'secret_santa') {
      return reply.code(400).send({ error: 'event_is_not_secret_santa' });
    }

    const existing = await db
      .select()
      .from(eventPairings)
      .where(eq(eventPairings.eventId, eventId));
    if (existing.length > 0 && !force) {
      return reply.send({
        ok: true,
        cached: true,
        seed: existing[0]?.seed ?? null,
        pairings: existing.map((p) => ({
          giverId: p.giverUserId,
          recipientId: p.recipientUserId,
        })),
      });
    }

    const participants = await db
      .select({
        userId: eventParticipants.userId,
      })
      .from(eventParticipants)
      .where(eq(eventParticipants.eventId, eventId));

    if (participants.length < 2) {
      return reply.code(400).send({ error: 'need_at_least_two_participants' });
    }

    const userIds = participants.map((p) => p.userId);

    const groupRelationships = await db
      .select({
        fromUserId: relationships.fromUserId,
        toUserId: relationships.toUserId,
        type: relationships.type,
      })
      .from(relationships)
      .where(
        and(
          eq(relationships.groupId, event.groupId),
          inArray(relationships.fromUserId, userIds),
          inArray(relationships.toUserId, userIds),
        ),
      );

    const priorEvents = await db
      .select({ id: events.id })
      .from(events)
      .where(
        and(eq(events.groupId, event.groupId), eq(events.type, 'secret_santa')),
      );
    const priorEventIds = priorEvents.map((e) => e.id).filter((id) => id !== eventId);

    const priorPairings =
      priorEventIds.length > 0
        ? await db
            .select({
              giverUserId: eventPairings.giverUserId,
              recipientUserId: eventPairings.recipientUserId,
            })
            .from(eventPairings)
            .where(inArray(eventPairings.eventId, priorEventIds))
        : [];

    const exclusions = buildExclusions(groupRelationships, priorPairings);
    const seed = Math.floor(Math.random() * 2 ** 31);

    const result = draw({
      participants: userIds.map((id) => ({ id, displayName: id })),
      exclusions,
      seed,
    });

    if (!result.ok) {
      return reply.code(409).send({
        error: 'draw_infeasible',
        conflicts: result.conflicts,
      });
    }

    await db.transaction(async (tx) => {
      if (force && existing.length > 0) {
        await tx.delete(eventPairings).where(eq(eventPairings.eventId, eventId));
      }
      await tx.insert(eventPairings).values(
        result.pairings.map((p) => ({
          eventId,
          giverUserId: p.giverId,
          recipientUserId: p.recipientId,
          seed,
        })),
      );
    });

    return reply.send({
      ok: true,
      cached: false,
      seed,
      pairings: result.pairings,
    });
  });
}
