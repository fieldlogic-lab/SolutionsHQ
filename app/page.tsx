import Link from "next/link";
import { projects } from "@/data/projects";
import { ideas } from "@/data/ideas";

export default function Dashboard() {
  const active = projects.filter(p => p.status === "Active");
  const inactive = projects.filter(p => p.status !== "Active");

  return <main>
    <section className="metric-row">
      <div className="metric"><strong>{active.length}</strong><span>Active Projects</span></div>
      <div className="metric"><strong>{inactive.length}</strong><span>Inactive / Parked</span></div>
      <div className="metric"><strong>{ideas.length}</strong><span>Ideas Captured</span></div>
      <div className="metric"><strong>{ideas.filter(i=>i.status==="Project Candidate").length}</strong><span>Project Candidates</span></div>
    </section>

    <div className="grid">
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Projects</h2>
            <p className="small">Open one when you want Solutions HQ to put you back to work.</p>
          </div>
        </div>
        <div className="cards">
          {projects.map(project => <article className="card" key={project.slug}>
            <div>
              <div className="name">{project.name}</div>
              <div className="small">{project.description}</div>
            </div>
            <div><span className="badge">{project.status}</span></div>
            <div><span className="badge">{project.stage}</span></div>
            <div>
              <div>{project.currentStatus}</div>
              <div className="small">Updated {project.lastUpdate}</div>
            </div>
            <Link className="button" href={`/projects/${project.slug}`}>Resume</Link>
          </article>)}
        </div>
      </section>

      <aside className="stack">
        <section className="panel">
          <h2>Innovation Lab</h2>
          {ideas.slice(0,4).map(idea => <div className="idea" key={idea.slug}>
            <div className="idea-head"><strong>{idea.name}</strong><span className="badge">{idea.status}</span></div>
            <p>{idea.description}</p>
            <div className="small">Next: {idea.nextStep}</div>
          </div>)}
          <p><Link className="button" href="/ideas">Open Innovation Lab</Link></p>
        </section>
        <section className="panel">
          <h2>Operating Rule</h2>
          <p className="small">HQ is the command layer. GitHub and project source-of-truth files remain authoritative.</p>
        </section>
      </aside>
    </div>
  </main>;
}
