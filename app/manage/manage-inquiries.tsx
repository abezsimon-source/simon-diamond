"use client";

import { useCallback, useEffect, useState } from "react";

type Inquiry = { id: number; name: string; email: string; phone: string; tournament: string; message: string; createdAt: string };

export default function ManageInquiries() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const response = await fetch("/api/inquiries", { cache: "no-store" });
    const data = await response.json();
    setItems(data.inquiries || []);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function remove(id: number) {
    if (!confirm("Remove this message?")) return;
    await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    await load();
  }

  return <section className="inquiry-manager">
    <div className="inquiry-heading"><div><p className="eyebrow red">Contact form</p><h2>Messages</h2></div><span>{items.length} message{items.length === 1 ? "" : "s"}</span></div>
    {loading ? <p>Loading messages…</p> : items.length ? <div className="inquiry-list">{items.map(item => <article className="inquiry-card" key={item.id}>
      <div className="inquiry-card-top"><div><h3>{item.name}</h3><p>{new Date(item.createdAt).toLocaleString()}</p></div><button onClick={() => remove(item.id)}>Remove</button></div>
      <p className="inquiry-topic">{item.tournament}</p>
      <p className="inquiry-message">{item.message}</p>
      <div className="inquiry-contact"><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}</div>
    </article>)}</div> : <p className="no-inquiries">No messages yet.</p>}
  </section>;
}
