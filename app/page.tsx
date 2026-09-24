import Link from "next/link";
import { projects } from "@/data/projects";
import { ideas } from "@/data/ideas";
import ProjectCardExpandable from "@/components/ProjectCardExpandable";

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
      <section className="panel project-panel">
        <div className="section-heading">
          <div>
            <h2>Projects</h2>
            <p className="small">Resume immediately, or expand a project to see its next move and source links.</p>
          </div>
        </div>

        <div className="cards">
          {projects.map(project => (
            <ProjectCardExpandable project={project} key={project.slug} />
          ))}
        </div>
      </section>

      <aside className="stack">
        <section className="panel innovation-preview">
          <div className="section-heading">
            <div>
              <h2>Innovation Lab</h2>
              <p className="small">Ideas worth coming back to.</p>
            </div>
          </div>
          {ideas.slice(0,4).map(idea => (
            <Link className="idea preview-idea" href={`/ideas/${idea.slug}`} key={idea.slug}>
              <div className="idea-head">
                <strong>{idea.name}</strong>
                <span className="badge">{idea.status}</span>
              </div>
              <p>{idea.description}</p>
              <div className="idea-preview-footer">
                <span className="small">Next: {idea.nextStep}</span>
                <span className="resume-link">Resume →</span>
              </div>
            </Link>
          ))}
          <p><Link className="button wide-on-mobile" href="/ideas">Browse All Ideas</Link></p>
        </section>

        <section className="panel desktop-rule">
          <h2>Operating Rule</h2>
          <p className="small">HQ is the command layer. GitHub and project source-of-truth files remain authoritative.</p>
        </section>
      </aside>
    </div>
  </main>;
}
