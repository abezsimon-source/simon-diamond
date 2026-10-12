"use client";

import { useEffect } from "react";

function savedId(key: string, storage: Storage) {
  let value = storage.getItem(key);
  if (!value) { value = crypto.randomUUID(); storage.setItem(key, value); }
  return value;
}

export default function VisitorTracker() {
  useEffect(() => {
    try {
      void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visitorId: savedId("simon-diamond-visitor", localStorage), sessionId: savedId("simon-diamond-session", sessionStorage), path: window.location.pathname, referrer: document.referrer }), keepalive: true });
    } catch { /* Privacy settings may block browser storage. */ }
  }, []);
  return null;
}
