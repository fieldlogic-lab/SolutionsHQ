import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(p => p.slug === slug);
  if (!project) notFound();
  return <main className="detail">
    <Link className="small" href="/">← Dashboard</Link>
    <h1>{project.name}</h1><p className="small">{project.description}</p>
    <div style={{display:"flex",gap:8,marginTop:12}}><span className="badge">{project.status}</span><span className="badge">{project.stage}</span>{project.progress !== undefined && <span className="badge">{project.progress}%</span>}</div>
    <div className="detail-grid">
      <section className="panel"><h2>Current Status</h2><p>{project.currentStatus}</p><div className="small">Last update: {project.lastUpdate}</div></section>
      <section className="panel"><h2>Next Step</h2><p>{project.nextStep}</p></section>
      <section className="panel"><h2>Project Access</h2>{project.repo ? <p><a className="button" href={project.repo}>Open GitHub Repository</a></p> : <p className="small">Repository link not yet registered.</p>}{project.app && <p><a className="button" href={project.app}>Open Application</a></p>}</section>
      <section className="panel"><h2>Resume Work</h2><p>Use this page as the re-entry point. Future versions will assemble recent commits, open issues, decisions, documents, and the recommended next work packet automatically.</p></section>
    </div>
  </main>;
}
