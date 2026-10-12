import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../../db";
import { games } from "../../../../../../db/schema";
import { requireAdminApi } from "../../../../../../lib/admin";

type RouteContext = { params: Promise<{ id: string; gameId: string }> };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id, gameId } = await params;
  await (await getDb()).delete(games).where(and(eq(games.id, Number(gameId)), eq(games.tournamentId, Number(id))));
  return Response.json({ ok: true });
}
