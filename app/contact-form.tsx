"use client";

import { FormEvent, useState } from "react";

export default function ContactForm({ tournamentOptions }: { tournamentOptions: string[] }) {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus("Sending your message…");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || "Your message could not be sent. Please try again.");
        return;
      }
      try {
        await fetch("https://formsubmit.co/ajax/abezsimon@gmail.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            ...values,
            _subject: `New Simon Diamond message from ${String(values.name || "a visitor")}`,
            _template: "table",
            _captcha: "false",
          }),
        });
      } catch {
        // The message remains saved on the private management page.
      }
      form.reset();
      setStatus("Message sent. We’ll get back to you soon.");
    } catch {
      setStatus("Your message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return <form className="contact-form" onSubmit={submit}>
    <label>Your name<input name="name" required maxLength={80} autoComplete="name" /></label>
    <label>Email address<input name="email" required type="email" maxLength={160} autoComplete="email" /></label>
    <label>Phone number <small>Optional</small><input name="phone" type="tel" maxLength={40} autoComplete="tel" /></label>
    <label>Tournament<select name="tournament"><option>General question</option>{tournamentOptions.map(option => <option key={option}>{option}</option>)}</select></label>
    <label className="contact-message">How can we help?<textarea name="message" required maxLength={1500} rows={5} /></label>
    <label className="contact-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <div className="contact-submit"><button className="primary-button" type="submit" disabled={sending}>{sending ? "Sending…" : "Send Message →"}</button><p aria-live="polite">{status}</p></div>
  </form>;
}
