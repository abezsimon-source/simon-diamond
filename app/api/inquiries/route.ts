import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { inquiries } from "../../../db/schema";
import { requireAdminApi } from "../../../lib/admin";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  return Response.json({ inquiries: await (await getDb()).select().from(inquiries).orderBy(desc(inquiries.id)) });
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, string>;
  if (body.website) return Response.json({ ok: true });
  const name = body.name?.trim().slice(0, 80);
  const email = body.email?.trim().slice(0, 160);
  const phone = body.phone?.trim().slice(0, 40) || "";
  const tournament = body.tournament?.trim().slice(0, 160) || "General question";
  const message = body.message?.trim().slice(0, 1500);
  if (!name || !email || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: "Please provide your name, a valid email address, and a message." }, { status: 400 });
  }
  await (await getDb()).insert(inquiries).values({ name, email, phone, tournament, message, createdAt: new Date().toISOString() });
  return Response.json({ ok: true }, { status: 201 });
}
