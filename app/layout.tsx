import "./globals.css";
import Link from "next/link";
import type { Metadata, Viewport } from "next";
import InstallApp from "@/components/InstallApp";

export const metadata: Metadata = {
  title: "Solutions HQ",
  description: "Portfolio and innovation command center",
  applicationName: "Solutions HQ",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" }], apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }] },
  appleWebApp: { capable: true, title: "Solutions HQ", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0d10" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="shell"><header className="topbar"><div className="brand"><h1>Solutions HQ</h1><p>Portfolio, projects, and invention pipeline.</p></div><div className="topbar-actions"><nav className="nav" aria-label="Main navigation"><Link href="/">Dashboard</Link><Link href="/ideas">Innovation Lab</Link></nav><InstallApp /></div></header>{children}</div></body></html>;
}
