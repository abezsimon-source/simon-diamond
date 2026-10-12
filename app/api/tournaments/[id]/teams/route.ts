import { getDb } from "../../../../../db";
import { teams } from "../../../../../db/schema";
import { requireAdminApi } from "../../../../../lib/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const tournamentId = Number((await params).id);
  const body = await request.json() as { name?: string };
  const name = body.name?.trim();
  if (!name) return Response.json({ error: "Team name is required." }, { status: 400 });
  const [team] = await (await getDb()).insert(teams).values({ tournamentId, name }).returning();
  return Response.json({ team }, { status: 201 });
}
