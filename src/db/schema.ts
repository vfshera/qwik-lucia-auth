import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  githubId: integer("github_id").unique().notNull(),
  username: text("username").notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    precision: 3,
  })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;

export type CreateUser = Omit<typeof users.$inferInsert, "createdAt">;

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export default { users, sessions };
