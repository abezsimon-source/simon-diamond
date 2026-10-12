# Export contents

- `app/` — website pages, management interface, API routes, standings, results, contact form, and analytics
- `worker/` — Cloudflare Worker entry point
- `db/` — Drizzle application schema and database access
- `drizzle/` — complete migration history and snapshots
- `database/schema.sql` — consolidated database structure for a new D1 database
- `public/` — logo, photo gallery, and other static assets
- `build/`, `scripts/`, `tests/` — build integration, validation, and tests
- `.openai/hosting.json` — existing binding names used by the source
- `CLOUDFLARE_MIGRATION.md` — migration notes and known handoff requirements

This is a source-and-structure export. It intentionally excludes live database rows, uploaded schedule graphics, source-control metadata, build output, dependencies, and secrets.
