import { getDb } from "../../../db";
import { tournaments } from "../../../db/schema";
import { requireAdminApi } from "../../../lib/admin";
import { listTournaments } from "../../../lib/tournaments";

export async function GET() {
  try {
    return Response.json({ tournaments: await listTournaments() });
  } catch {
    return Response.json({ error: "Tournament listings are temporarily unavailable." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const body = await request.json() as Partial<typeof tournaments.$inferInsert>;
  if (!body.eventDate || !body.sport?.trim() || !body.division?.trim()) {
    return Response.json({ error: "Date, sport, and division are required." }, { status: 400 });
  }
  const [created] = await (await getDb()).insert(tournaments).values({
    eventDate: body.eventDate,
    sport: body.sport.trim(),
    division: body.division.trim(),
    status: body.status?.trim() || "Open registration",
    format: body.format?.trim() || "3-game guarantee · Round robin",
    entryFee: Number(body.entryFee) || 350,
    registrationUrl: body.registrationUrl?.trim() || "",
    sortOrder: Number(body.sortOrder) || 0,
  }).returning();
  return Response.json({ tournament: { ...created, teams: [], games: [] } }, { status: 201 });
}
