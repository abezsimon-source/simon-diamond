import { redirect } from "next/navigation";
import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { ADMIN_EMAIL } from "../../lib/admin";
import ManageTournaments from "./manage-tournaments";
import ManageInquiries from "./manage-inquiries";
import VisitorAnalytics from "./visitor-analytics";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const user = await requireChatGPTUser("/manage");
  if (user.email.toLowerCase() !== ADMIN_EMAIL) redirect("/");
  return <main className="manage-page">
    <header className="manage-header">
      <a className="brand" href="/"><img className="brand-logo" src="/gallery/00-simon-diamond-logo.png" alt="Simon Diamond"/><span><strong>SIMON DIAMOND</strong><small>Tournament Manager</small></span></a>
      <div><a href="/" target="_blank">View public site</a><a href={chatGPTSignOutPath("/")}>Sign out</a></div>
    </header>
    <section className="manage-shell">
      <div className="manage-title"><div><p className="eyebrow red">Private management</p><h1>Manage tournaments</h1></div><p>Signed in as {user.displayName}</p></div>
      <ManageTournaments />
      <VisitorAnalytics />
      <ManageInquiries />
    </section>
  </main>;
}
