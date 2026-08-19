import { relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

/**
 * Match Status Enum
 * Represents the lifecycle of a sporting event.
 */
export const matchStatusEnum = pgEnum('match_status', [
  'scheduled',
  'live',
  'finished',
]);

/**
 * Matches Table
 * Stores real-time sports match fixtures, scores, and status.
 */
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: text('sport').notNull(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  status: matchStatusEnum('status').default('scheduled').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }),
  endTime: timestamp('end_time', { withTimezone: true }),
  homeScore: integer('home_score').default(0).notNull(),
  awayScore: integer('away_score').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Commentary Table
 * Stores real-time play-by-play events, messages, and metadata for matches.
 */
export const commentary = pgTable(
  'commentary',
  {
    id: serial('id').primaryKey(),
    matchId: integer('match_id')
      .references(() => matches.id, { onDelete: 'cascade' })
      .notNull(),
    minute: integer('minute'),
    sequence: integer('sequence').notNull(),
    period: text('period'),
    eventType: text('event_type').notNull(),
    actor: text('actor'),
    team: text('team'),
    message: text('message').notNull(),
    metadata: jsonb('metadata'),
    tags: text('tags').array(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Composite index for fast timeline queries and WebSocket streaming ordering
    index('commentary_match_id_sequence_idx').on(table.matchId, table.sequence),
  ]
);

/**
 * Drizzle ORM Relations
 */
export const matchesRelations = relations(matches, ({ many }) => ({
  commentaries: many(commentary),
}));

export const commentaryRelations = relations(commentary, ({ one }) => ({
  match: one(matches, {
    fields: [commentary.matchId],
    references: [matches.id],
  }),
}));
