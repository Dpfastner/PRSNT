import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  jsonb,
  primaryKey,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// -- Enums ------------------------------------------------------------------

export const groupTypeEnum = pgEnum('group_type', [
  'family',
  'friends',
  'coworkers',
  'mixed',
]);

export const groupRoleEnum = pgEnum('group_role', ['admin', 'member']);

export const relationshipTypeEnum = pgEnum('relationship_type', [
  'spouse',
  'parent',
  'child',
  'sibling',
  'friend',
  'coworker',
  'manual_exclude',
]);

export const eventTypeEnum = pgEnum('event_type', [
  'secret_santa',
  'birthday',
  'anniversary',
  'graduation',
  'wedding',
  'baby_shower',
  'corporate',
  'just_because',
]);

export const eventRoleEnum = pgEnum('event_role', [
  'organizer',
  'participant',
  'recipient',
]);

// -- Users ------------------------------------------------------------------

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  authProviderId: text('auth_provider_id'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// -- Profiles ---------------------------------------------------------------

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    version: integer('version').notNull().default(1),
    birthday: date('birthday'),
    partyStyle: text('party_style'),
    favoriteColor: text('favorite_color'),
    giftCategoriesLiked: text('gift_categories_liked').array().notNull().default([]),
    giftCategoriesDisliked: text('gift_categories_disliked').array().notNull().default([]),
    hobbies: text('hobbies').array().notNull().default([]),
    wontBuySelf: text('wont_buy_self').array().notNull().default([]),
    underTenItems: text('under_ten_items').array().notNull().default([]),
    wishList: text('wish_list').array().notNull().default([]),
    giftCardStores: text('gift_card_stores').array().notNull().default([]),
    secretWish: text('secret_wish'),
    sizes: jsonb('sizes').$type<Record<string, string>>().notNull().default({}),
    doNotGift: text('do_not_gift').array().notNull().default([]),
    bigFive: jsonb('big_five').$type<{
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    }>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index('profiles_user_idx').on(t.userId),
  }),
);

// -- Groups -----------------------------------------------------------------

export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: groupTypeEnum('type').notNull().default('family'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const groupMemberships = pgTable(
  'group_memberships',
  {
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: groupRoleEnum('role').notNull().default('member'),
    joinedAt: timestamp('joined_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.userId] }),
    userIdx: index('group_memberships_user_idx').on(t.userId),
  }),
);

// -- Relationships ----------------------------------------------------------

// A directed edge: fromUser → toUser, type. Used to derive Secret Santa
// exclusions and to give the suggestion engine relational context.
export const relationships = pgTable(
  'relationships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    fromUserId: uuid('from_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    toUserId: uuid('to_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: relationshipTypeEnum('type').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    groupIdx: index('relationships_group_idx').on(t.groupId),
    fromIdx: index('relationships_from_idx').on(t.fromUserId),
  }),
);

// -- Events -----------------------------------------------------------------

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    type: eventTypeEnum('type').notNull(),
    name: text('name').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    budgetMinUsd: integer('budget_min_usd'),
    budgetMaxUsd: integer('budget_max_usd'),
    rules: jsonb('rules').$type<Record<string, unknown>>().notNull().default({}),
    occasionContext: text('occasion_context'),
    recipientUserId: uuid('recipient_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    groupIdx: index('events_group_idx').on(t.groupId),
    recipientIdx: index('events_recipient_idx').on(t.recipientUserId),
  }),
);

export const eventParticipants = pgTable(
  'event_participants',
  {
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: eventRoleEnum('role').notNull().default('participant'),
    joinedAt: timestamp('joined_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.eventId, t.userId] }),
    userIdx: index('event_participants_user_idx').on(t.userId),
  }),
);

// Result of a Secret Santa draw — one row per giver→recipient pairing.
export const eventPairings = pgTable(
  'event_pairings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    giverUserId: uuid('giver_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    recipientUserId: uuid('recipient_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    seed: integer('seed').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    eventIdx: index('event_pairings_event_idx').on(t.eventId),
    giverIdx: index('event_pairings_giver_idx').on(t.giverUserId),
  }),
);

// -- Suggestions + Gifts ----------------------------------------------------

export const suggestions = pgTable(
  'suggestions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id, {
      onDelete: 'set null',
    }),
    giverUserId: uuid('giver_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    recipientUserId: uuid('recipient_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    ranked: jsonb('ranked').$type<unknown[]>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    giverIdx: index('suggestions_giver_idx').on(t.giverUserId),
    recipientIdx: index('suggestions_recipient_idx').on(t.recipientUserId),
  }),
);

export const gifts = pgTable(
  'gifts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id, {
      onDelete: 'set null',
    }),
    giverUserId: uuid('giver_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    recipientUserId: uuid('recipient_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    catalogSource: text('catalog_source'),
    productUrl: text('product_url'),
    priceUsd: integer('price_usd'),
    givenAt: timestamp('given_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    recipientIdx: index('gifts_recipient_idx').on(t.recipientUserId),
    eventIdx: index('gifts_event_idx').on(t.eventId),
  }),
);

// -- Drizzle relations ------------------------------------------------------

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  memberships: many(groupMemberships),
  eventParticipants: many(eventParticipants),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const groupsRelations = relations(groups, ({ many, one }) => ({
  memberships: many(groupMemberships),
  relationships: many(relationships),
  events: many(events),
  creator: one(users, { fields: [groups.createdBy], references: [users.id] }),
}));

export const groupMembershipsRelations = relations(
  groupMemberships,
  ({ one }) => ({
    group: one(groups, {
      fields: [groupMemberships.groupId],
      references: [groups.id],
    }),
    user: one(users, {
      fields: [groupMemberships.userId],
      references: [users.id],
    }),
  }),
);

export const eventsRelations = relations(events, ({ one, many }) => ({
  group: one(groups, { fields: [events.groupId], references: [groups.id] }),
  recipient: one(users, {
    fields: [events.recipientUserId],
    references: [users.id],
  }),
  participants: many(eventParticipants),
  pairings: many(eventPairings),
  suggestions: many(suggestions),
  gifts: many(gifts),
}));

export const eventParticipantsRelations = relations(
  eventParticipants,
  ({ one }) => ({
    event: one(events, {
      fields: [eventParticipants.eventId],
      references: [events.id],
    }),
    user: one(users, {
      fields: [eventParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const eventPairingsRelations = relations(eventPairings, ({ one }) => ({
  event: one(events, {
    fields: [eventPairings.eventId],
    references: [events.id],
  }),
  giver: one(users, {
    fields: [eventPairings.giverUserId],
    references: [users.id],
  }),
  recipient: one(users, {
    fields: [eventPairings.recipientUserId],
    references: [users.id],
  }),
}));
