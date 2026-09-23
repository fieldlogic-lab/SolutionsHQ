import "./globals.css";
import Link from "next/link";

export const metadata = { title: "Solutions HQ", description: "Portfolio and innovation command center" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="shell"><header className="topbar"><div className="brand"><h1>Solutions HQ</h1><p>Portfolio, projects, and invention pipeline.</p></div><nav className="nav"><Link href="/">Dashboard</Link><Link href="/ideas">Innovation Lab</Link></nav></header>{children}</div></body></html>;
}
