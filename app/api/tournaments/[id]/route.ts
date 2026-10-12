import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { tournaments } from "../../../../db/schema";
import { requireAdminApi } from "../../../../lib/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const id = Number((await params).id);
  const body = await request.json() as Partial<typeof tournaments.$inferInsert>;
  const [updated] = await (await getDb()).update(tournaments).set({
    ...(body.eventDate && { eventDate: body.eventDate }),
    ...(body.sport?.trim() && { sport: body.sport.trim() }),
    ...(body.division?.trim() && { division: body.division.trim() }),
    ...(body.status?.trim() && { status: body.status.trim() }),
    ...(body.format?.trim() && { format: body.format.trim() }),
    ...(body.entryFee !== undefined && { entryFee: Number(body.entryFee) }),
    ...(body.registrationUrl !== undefined && { registrationUrl: body.registrationUrl.trim() }),
  }).where(eq(tournaments.id, id)).returning();
  if (!updated) return Response.json({ error: "Tournament not found." }, { status: 404 });
  return Response.json({ tournament: updated });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const id = Number((await params).id);
  const db = await getDb();
  const [existing] = await db.select({ scheduleKey: tournaments.scheduleKey }).from(tournaments).where(eq(tournaments.id, id));
  await db.delete(tournaments).where(eq(tournaments.id, id));
  const { env } = await import("cloudflare:workers");
  const storage = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
  if (existing?.scheduleKey && storage) await storage.delete(existing.scheduleKey);
  return Response.json({ ok: true });
}
