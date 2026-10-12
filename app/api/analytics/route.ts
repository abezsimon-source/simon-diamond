import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { pageViews } from "../../../db/schema";
import { requireAdminApi } from "../../../lib/admin";

const botPattern = /bot|crawler|spider|headless|preview|facebookexternalhit|slurp|curl|wget/i;

function sourceFrom(referrer: string) {
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes("facebook") || host === "fb.com" || host === "l.facebook.com") return "Facebook";
    if (host.includes("google")) return "Google";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("thesimondiamond.com")) return "Website";
    return host.replace(/^www\./, "").slice(0, 80);
  } catch { return "Direct"; }
}

export async function POST(request: Request) {
  if (botPattern.test(request.headers.get("user-agent") || "")) return Response.json({ ok: true });
  const body = await request.json().catch(() => ({})) as Record<string, string>;
  const visitorId = body.visitorId?.slice(0, 80), sessionId = body.sessionId?.slice(0, 80);
  if (!visitorId || !sessionId) return Response.json({ ok: true });
  const cloudflare = (request as Request & { cf?: { region?: string; country?: string } }).cf;
  await (await getDb()).insert(pageViews).values({ visitorId, sessionId, path: body.path?.startsWith("/") ? body.path.slice(0, 160) : "/", source: sourceFrom(body.referrer || ""), region: cloudflare?.region?.slice(0, 80) || "Unknown", country: cloudflare?.country?.slice(0, 40) || request.headers.get("cf-ipcountry")?.slice(0, 40) || "Unknown", createdAt: new Date().toISOString() });
  return Response.json({ ok: true }, { status: 201 });
}

function counts(values: string[]) {
  return Object.entries(values.reduce<Record<string, number>>((all, value) => { all[value] = (all[value] || 0) + 1; return all; }, {})).sort((a, b) => b[1] - a[1]);
}

export async function GET() {
  const denied = await requireAdminApi(); if (denied) return denied;
  const views = await (await getDb()).select().from(pageViews).orderBy(desc(pageViews.id)).limit(10000);
  const now = Date.now(), since = (days: number) => views.filter(view => new Date(view.createdAt).getTime() >= now - days * 86400000), unique = (rows: typeof views) => new Set(rows.map(row => row.visitorId)).size;
  const firstSeen = new Map<string, string>();
  for (const view of [...views].reverse()) if (!firstSeen.has(view.visitorId)) firstSeen.set(view.visitorId, view.createdAt);
  const month = since(30), newVisitors = new Set(month.filter(view => firstSeen.get(view.visitorId) === view.createdAt).map(view => view.visitorId)).size, monthlyUnique = unique(month);
  return Response.json({ totals: { views: views.length, unique: unique(views), today: since(1).length, week: since(7).length, month: month.length, monthlyUnique, newVisitors, returningVisitors: Math.max(0, monthlyUnique - newVisitors) }, daily: Array.from({ length: 14 }, (_, index) => { const date = new Date(now - (13 - index) * 86400000).toISOString().slice(0, 10), rows = views.filter(view => view.createdAt.slice(0, 10) === date); return { date, views: rows.length, unique: unique(rows) }; }), sources: counts(month.map(view => view.source)).slice(0, 6), locations: counts(month.map(view => view.region !== "Unknown" ? view.region : view.country).filter(value => value !== "Unknown")).slice(0, 6) });
}
