import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { tournaments } from "../../../../../db/schema";
import { requireAdminApi } from "../../../../../lib/admin";

type RouteContext = { params: Promise<{ id: string }> };

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function bucket() {
  const { env } = await import("cloudflare:workers");
  const storage = (env as unknown as { BUCKET?: R2Bucket }).BUCKET;
  if (!storage) throw new Error("Schedule storage is unavailable.");
  return storage;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });
  const [tournament] = await (await getDb()).select({ scheduleKey: tournaments.scheduleKey }).from(tournaments).where(eq(tournaments.id, id));
  if (!tournament?.scheduleKey) return new Response("No schedule has been posted.", { status: 404 });
  const object = await (await bucket()).get(tournament.scheduleKey);
  if (!object) return new Response("No schedule has been posted.", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=300");
  headers.set("Content-Disposition", "inline");
  return new Response(object.body, { headers });
}

export async function POST(request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const id = Number((await params).id);
  const form = await request.formData();
  const file = form.get("schedule");
  if (!(file instanceof File) || !allowedTypes.has(file.type)) {
    return Response.json({ error: "Choose a JPG, PNG, or WebP image." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return Response.json({ error: "The image must be smaller than 8 MB." }, { status: 400 });
  }
  const db = await getDb();
  const [existing] = await db.select({ scheduleKey: tournaments.scheduleKey }).from(tournaments).where(eq(tournaments.id, id));
  if (!existing) return Response.json({ error: "Tournament not found." }, { status: 404 });
  const key = `schedules/tournament-${id}-${Date.now()}.${extensions[file.type]}`;
  const storage = await bucket();
  await storage.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  await db.update(tournaments).set({ scheduleKey: key }).where(eq(tournaments.id, id));
  if (existing.scheduleKey) await storage.delete(existing.scheduleKey);
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const id = Number((await params).id);
  const db = await getDb();
  const [existing] = await db.select({ scheduleKey: tournaments.scheduleKey }).from(tournaments).where(eq(tournaments.id, id));
  if (!existing) return Response.json({ error: "Tournament not found." }, { status: 404 });
  await db.update(tournaments).set({ scheduleKey: null }).where(eq(tournaments.id, id));
  if (existing.scheduleKey) await (await bucket()).delete(existing.scheduleKey);
  return Response.json({ ok: true });
}
