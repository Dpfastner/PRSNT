import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { and, eq, gte, isNull, or, asc, inArray } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import {
  events,
  eventParticipants,
  groups,
  groupMemberships,
  users,
  profiles,
} from '../db/schema.js';

const ParamsSchema = z.object({ userId: z.string().uuid() });

export function registerHomeRoutes(app: FastifyInstance, db: Database) {
  app.get('/users/:userId/home', async (request, reply) => {
    const { userId } = ParamsSchema.parse(request.params);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) return reply.code(404).send({ error: 'user_not_found' });

    const userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        type: groups.type,
        role: groupMemberships.role,
      })
      .from(groupMemberships)
      .innerJoin(groups, eq(groupMemberships.groupId, groups.id))
      .where(eq(groupMemberships.userId, userId));

    const groupIds = userGroups.map((g) => g.id);

    const upcomingEvents =
      groupIds.length === 0
        ? []
        : await db
            .select({
              id: events.id,
              groupId: events.groupId,
              type: events.type,
              name: events.name,
              startsAt: events.startsAt,
              recipientUserId: events.recipientUserId,
            })
            .from(events)
            .where(
              and(
                inArray(events.groupId, groupIds),
                or(
                  gte(events.startsAt, new Date()),
                  isNull(events.startsAt),
                ),
              ),
            )
            .orderBy(asc(events.startsAt));

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    return reply.send({
      user: {
        id: user.id,
        displayName: user.displayName,
        hasProfile: profile !== undefined,
      },
      groups: userGroups,
      upcomingEvents,
    });
  });
}
