import type { Metadata } from "next";
import "./globals.css";
import "./manager-fields.css";
import "./analytics.css";
import "./archive.css";

export const metadata: Metadata = {
  title: "Simon Diamond Tournaments",
  description: "Youth baseball and softball tournaments at Simon Diamond in Center Point, Iowa.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
