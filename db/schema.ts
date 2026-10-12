import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tournaments = sqliteTable("tournaments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventDate: text("event_date").notNull(),
  sport: text("sport").notNull(),
  division: text("division").notNull(),
  status: text("status").notNull().default("Open registration"),
  format: text("format").notNull().default("3-game guarantee · Round robin"),
  entryFee: integer("entry_fee").notNull().default(350),
  registrationUrl: text("registration_url").notNull().default("https://forms.gle/bnM2JpHxX5b4Jff96"),
  scheduleKey: text("schedule_key"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const games = sqliteTable("games", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  homeTeamId: integer("home_team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  awayTeamId: integer("away_team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  homeScore: integer("home_score").notNull(),
  awayScore: integer("away_score").notNull(),
  homeCounts: integer("home_counts", { mode: "boolean" }).notNull().default(true),
  awayCounts: integer("away_counts", { mode: "boolean" }).notNull().default(true),
  gameLabel: text("game_label").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  tournament: text("tournament").notNull().default("General question"),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});

export const pageViews = sqliteTable("page_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  visitorId: text("visitor_id").notNull(),
  sessionId: text("session_id").notNull(),
  path: text("path").notNull().default("/"),
  source: text("source").notNull().default("Direct"),
  region: text("region").notNull().default("Unknown"),
  country: text("country").notNull().default("Unknown"),
  createdAt: text("created_at").notNull(),
});
