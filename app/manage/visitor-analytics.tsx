"use client";

import { useEffect, useState } from "react";

type Analytics = { totals: { views: number; unique: number; today: number; week: number; month: number; monthlyUnique: number }; daily: { date: string; views: number; unique: number }[]; sources: [string, number][]; locations: [string, number][] };

export default function VisitorAnalytics() {
  const [data, setData] = useState<Analytics | null>(null), [error, setError] = useState("");
  useEffect(() => { void fetch("/api/analytics", { cache: "no-store" }).then(async response => { if (!response.ok) throw new Error(); setData(await response.json()); }).catch(() => setError("Visitor information could not be loaded.")); }, []);
  return <section className="analytics-manager">
    <div className="inquiry-heading"><div><p className="eyebrow red">Website reach</p><h2>Visitor activity</h2></div><span>Anonymous estimates · automated visits filtered</span></div>
    {error && <p className="no-inquiries">{error}</p>}{!data && !error && <p className="no-inquiries">Loading visitor activity…</p>}
    {data && <><div className="analytics-cards"><article><span>Unique visitors</span><strong>{data.totals.unique}</strong><small>All time</small></article><article><span>Visits this month</span><strong>{data.totals.month}</strong><small>{data.totals.monthlyUnique} unique</small></article><article><span>Visits this week</span><strong>{data.totals.week}</strong><small>{data.totals.today} today</small></article><article><span>Total visits</span><strong>{data.totals.views}</strong><small>All time</small></article></div>
      <div className="analytics-details"><article><h3>Last 14 days</h3><div className="traffic-days">{data.daily.map(day => <div key={day.date}><span>{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span><strong>{day.views}</strong><small>{day.unique} unique</small></div>)}</div></article><article><h3>How people found you</h3>{data.sources.length ? <ol>{data.sources.map(([name, total]) => <li key={name}><span>{name}</span><strong>{total}</strong></li>)}</ol> : <p>Traffic sources will appear after visits are recorded.</p>}<h3 className="location-heading">General location</h3>{data.locations.length ? <ol>{data.locations.map(([name, total]) => <li key={name}><span>{name}</span><strong>{total}</strong></li>)}</ol> : <p>Location may not be available for every visit.</p>}</article></div>
      <p className="analytics-note">Unique visitors are estimated by browser. One person using two devices may count twice. No names, email addresses, or exact locations are collected.</p></>}
  </section>;
}
