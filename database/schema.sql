-- Simon Diamond Tournaments: consolidated Cloudflare D1 schema
-- Generated from db/schema.ts and the included Drizzle migrations.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  event_date TEXT NOT NULL,
  sport TEXT NOT NULL,
  division TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open registration',
  format TEXT NOT NULL DEFAULT '3-game guarantee · Round robin',
  entry_fee INTEGER NOT NULL DEFAULT 350,
  registration_url TEXT NOT NULL DEFAULT 'https://forms.gle/bnM2JpHxX5b4Jff96',
  schedule_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  tournament_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  tournament_id INTEGER NOT NULL,
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  home_counts INTEGER NOT NULL DEFAULT 1,
  away_counts INTEGER NOT NULL DEFAULT 1,
  game_label TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  tournament TEXT NOT NULL DEFAULT 'General question',
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '/',
  source TEXT NOT NULL DEFAULT 'Direct',
  region TEXT NOT NULL DEFAULT 'Unknown',
  country TEXT NOT NULL DEFAULT 'Unknown',
  created_at TEXT NOT NULL
);
