import { boolean, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const avatarProfiles = pgTable("avatar_profiles", {
  id: serial("id").primaryKey(),
  displayName: varchar("display_name", { length: 80 }).notNull().default("Selin"),
  activeLook: varchar("active_look", { length: 32 }).notNull().default("midnight"),
  activePersona: varchar("active_persona", { length: 32 }).notNull().default("selin"),
  adultMode: boolean("adult_mode").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
