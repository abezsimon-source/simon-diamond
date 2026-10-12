import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../../db";
import { teams } from "../../../../../../db/schema";
import { requireAdminApi } from "../../../../../../lib/admin";

type RouteContext = { params: Promise<{ id: string; teamId: string }> };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id, teamId } = await params;
  await (await getDb()).delete(teams).where(and(eq(teams.id, Number(teamId)), eq(teams.tournamentId, Number(id))));
  return Response.json({ ok: true });
}
