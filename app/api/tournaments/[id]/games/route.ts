import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { games, teams } from "../../../../../db/schema";
import { requireAdminApi } from "../../../../../lib/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const tournamentId = Number((await params).id);
  const body = await request.json() as { homeTeamId?: number; awayTeamId?: number; homeScore?: number; awayScore?: number; homeCounts?: boolean | string; awayCounts?: boolean | string; gameLabel?: string };
  const homeTeamId = Number(body.homeTeamId);
  const awayTeamId = Number(body.awayTeamId);
  const homeScore = Number(body.homeScore);
  const awayScore = Number(body.awayScore);
  if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId || !Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
    return Response.json({ error: "Choose two different teams and enter both scores." }, { status: 400 });
  }
  const tournamentTeams = await (await getDb()).select().from(teams).where(eq(teams.tournamentId, tournamentId));
  if (!tournamentTeams.some(team => team.id === homeTeamId) || !tournamentTeams.some(team => team.id === awayTeamId)) {
    return Response.json({ error: "Both teams must belong to this tournament." }, { status: 400 });
  }
  const [created] = await (await getDb()).insert(games).values({
    tournamentId, homeTeamId, awayTeamId, homeScore, awayScore,
    homeCounts: body.homeCounts === true || body.homeCounts === "on",
    awayCounts: body.awayCounts === true || body.awayCounts === "on",
    gameLabel: body.gameLabel?.trim() || "",
    createdAt: new Date().toISOString(),
  }).returning();
  return Response.json({ game: created }, { status: 201 });
}
