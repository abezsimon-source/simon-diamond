# Cloudflare migration handoff

This package is an export of the Simon Diamond Tournaments website source at the time it was requested. Creating this package did not modify or republish the live website.

## Included

- Complete application and Worker source code
- Static gallery images and site assets
- Drizzle database definitions in `db/schema.ts`
- Original migration history in `drizzle/`
- Consolidated D1 schema in `database/schema.sql`
- Build, validation, and test scripts
- Dependency lockfile

## Not included

- Live database records, including tournaments, teams, scores, inquiries, and visitor analytics
- Schedule graphics uploaded to object storage
- Passwords, tokens, credentials, or other secrets

Those items require separate data and object-storage exports if they need to be migrated.

## Cloudflare resources

The application expects these bindings:

| Binding | Cloudflare resource | Purpose |
| --- | --- | --- |
| `DB` | D1 database | Tournaments, teams, games, inquiries, and page views |
| `BUCKET` | R2 bucket | Uploaded game-day schedule graphics |
| `ASSETS` | Worker static assets | Built website assets |
| `IMAGES` | Cloudflare Images binding | Image optimization |

## Suggested migration sequence

1. Create a Cloudflare D1 database.
2. Apply `database/schema.sql`, or apply the migrations in `drizzle/` in numerical order.
3. Create an R2 bucket for schedule graphics.
4. Configure the bindings above in the Cloudflare Worker project.
5. Replace the current management-page authentication before making `/manage` public.
6. Install dependencies with `npm ci` and run `npm run build`.
7. Deploy the generated Worker with Cloudflare's deployment tooling.
8. Import live records and schedule files separately, if desired.
9. Test the public pages, registration links, contact form, analytics, schedule uploads, and management controls before changing DNS.

## Important authentication note

The existing management page relies on hosting-provided ChatGPT sign-in headers and routes implemented in `app/chatgpt-auth.ts`. A standalone Cloudflare deployment will not automatically provide those headers or routes. Replace that integration with Cloudflare Access or another authentication system before exposing the management page.

## Contact notifications

The contact form currently sends notification requests through FormSubmit. Review `app/contact-form.tsx` and confirm the recipient and service settings during migration.

## Database reference

The five D1 tables are:

- `tournaments`
- `teams`
- `games`
- `inquiries`
- `page_views`

The `home_counts` and `away_counts` fields allow one game result to count in one team's standings but not the other team's standings.

## Verification before DNS changes

Keep the existing live site active while testing the Cloudflare preview address. Only move the domain after the replacement passes testing. The source export itself does not change DNS or the current live deployment.
