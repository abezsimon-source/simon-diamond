import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { inquiries } from "../../../../db/schema";
import { requireAdminApi } from "../../../../lib/admin";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await context.params;
  await (await getDb()).delete(inquiries).where(eq(inquiries.id, Number(id)));
  return Response.json({ ok: true });
}
