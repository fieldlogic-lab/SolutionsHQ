import Link from "next/link";
import { notFound } from "next/navigation";
import ResumeInChatGPT from "@/components/ResumeInChatGPT";
import { projects } from "@/data/projects";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(p => p.slug === slug);
  if (!project) notFound();

  return <main className="detail">
    <Link className="small" href="/">← Dashboard</Link>
    <div className="project-heading">
      <div>
        <h1>{project.name}</h1>
        <p className="small">{project.description}</p>
      </div>
      <div className="project-badges">
        <span className="badge">{project.status}</span>
        <span className="badge">{project.stage}</span>
      </div>
    </div>

    <section className="panel resume-panel">
      <div>
        <div className="eyebrow">Recommended next move</div>
        <h2>{project.nextStep}</h2>
      </div>
      <ResumeInChatGPT
        name={project.name}
        description={project.description}
        currentStatus={project.currentStatus}
        nextStep={project.nextStep}
        repo={project.repo}
        supportingLinks={project.supportingLinks}
        chatgptProjectUrl={project.chatgptProjectUrl}
      />
    </section>

    <div className="detail-grid">
      <section className="panel">
        <h2>Current Status</h2>
        <p>{project.currentStatus}</p>
        <div className="small">Last meaningful update: {project.lastUpdate}</div>
      </section>

      <section className="panel">
        <h2>Project Access</h2>
        <div className="link-stack">
          {project.repo
            ? <a className="button" href={project.repo} target="_blank" rel="noreferrer">Open GitHub Repository</a>
            : <span className="small">Repository link not registered.</span>}
          {project.app && <a className="button" href={project.app} target="_blank" rel="noreferrer">Open Application</a>}
          {project.supportingLinks?.map(link => (
            <a className="button secondary-button" href={link.url} key={link.url} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  </main>;
}
