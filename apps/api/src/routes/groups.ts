import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import {
  groups,
  groupMemberships,
  relationships,
  users,
} from '../db/schema.js';

const GROUP_TYPES = ['family', 'friends', 'coworkers', 'mixed'] as const;
const RELATIONSHIP_TYPES = [
  'spouse',
  'parent',
  'child',
  'sibling',
  'friend',
  'coworker',
  'manual_exclude',
] as const;

const CreateGroupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(GROUP_TYPES).default('family'),
  createdByUserId: z.string().uuid(),
});

const AddMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['admin', 'member']).optional().default('member'),
});

const AddRelationshipSchema = z.object({
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  type: z.enum(RELATIONSHIP_TYPES),
});

const GroupParamsSchema = z.object({ id: z.string().uuid() });

export function registerGroupRoutes(app: FastifyInstance, db: Database) {
  app.post('/groups', async (request, reply) => {
    const body = CreateGroupSchema.parse(request.body);

    const result = await db.transaction(async (tx) => {
      const [group] = await tx
        .insert(groups)
        .values({
          name: body.name,
          type: body.type,
          createdBy: body.createdByUserId,
        })
        .returning();
      if (!group) throw new Error('failed to create group');

      await tx.insert(groupMemberships).values({
        groupId: group.id,
        userId: body.createdByUserId,
        role: 'admin',
      });

      return group;
    });

    return reply.code(201).send(result);
  });

  app.post('/groups/:id/members', async (request, reply) => {
    const { id: groupId } = GroupParamsSchema.parse(request.params);
    const body = AddMemberSchema.parse(request.body);

    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });
    if (!group) return reply.code(404).send({ error: 'group_not_found' });

    const existing = await db
      .select()
      .from(groupMemberships)
      .where(
        and(
          eq(groupMemberships.groupId, groupId),
          eq(groupMemberships.userId, body.userId),
        ),
      )
      .limit(1);
    if (existing.length > 0) {
      return reply.code(200).send({ ok: true, alreadyMember: true });
    }

    await db.insert(groupMemberships).values({
      groupId,
      userId: body.userId,
      role: body.role,
    });

    return reply.code(201).send({ ok: true });
  });

  app.get('/groups/:id', async (request, reply) => {
    const { id: groupId } = GroupParamsSchema.parse(request.params);

    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });
    if (!group) return reply.code(404).send({ error: 'group_not_found' });

    const members = await db
      .select({
        userId: users.id,
        displayName: users.displayName,
        role: groupMemberships.role,
        joinedAt: groupMemberships.joinedAt,
      })
      .from(groupMemberships)
      .innerJoin(users, eq(groupMemberships.userId, users.id))
      .where(eq(groupMemberships.groupId, groupId));

    const groupRelationships = await db
      .select({
        id: relationships.id,
        fromUserId: relationships.fromUserId,
        toUserId: relationships.toUserId,
        type: relationships.type,
      })
      .from(relationships)
      .where(eq(relationships.groupId, groupId));

    return reply.send({
      ...group,
      members,
      relationships: groupRelationships,
    });
  });

  app.post('/groups/:id/relationships', async (request, reply) => {
    const { id: groupId } = GroupParamsSchema.parse(request.params);
    const body = AddRelationshipSchema.parse(request.body);

    if (body.fromUserId === body.toUserId) {
      return reply.code(400).send({ error: 'self_relationship_not_allowed' });
    }

    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });
    if (!group) return reply.code(404).send({ error: 'group_not_found' });

    const [row] = await db
      .insert(relationships)
      .values({
        groupId,
        fromUserId: body.fromUserId,
        toUserId: body.toUserId,
        type: body.type,
      })
      .returning();

    return reply.code(201).send(row);
  });
}
