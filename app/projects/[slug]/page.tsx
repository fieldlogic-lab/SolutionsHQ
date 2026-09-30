import Link from "next/link";
import { notFound } from "next/navigation";
import ResumeInChatGPT from "@/components/ResumeInChatGPT";
import WorkstreamManager from "@/components/WorkstreamManager";
import { projects } from "@/data/projects";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(p => p.slug === slug);
  if (!project) notFound();

  const workstreams = project.workstreams ?? [
    {
      label: "Ship Next",
      title: "Move the current ship target forward",
      nextStep: project.nextStep,
      status: "Ready" as const,
    },
    {
      label: "Blockers",
      title: "Find and clear the highest-impact blocker",
      nextStep: "Review the current project state, identify the single biggest blocker to shipping, and remove it without expanding scope.",
      status: "Ready" as const,
    },
    {
      label: "Project State",
      title: "Reconcile the project source of truth",
      nextStep: "Compare the current implementation, repository, and source-of-truth material; update the working plan around what is actually true now.",
      status: "Ready" as const,
    },
  ];

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

    <WorkstreamManager
      project={{
        slug: project.slug,
        name: project.name,
        description: project.description,
        currentStatus: project.currentStatus,
        nextStep: project.nextStep,
        repo: project.repo,
        ssotUrl: project.ssotUrl,
        supportingLinks: project.supportingLinks,
        chatgptProjectUrl: project.chatgptProjectUrl,
      }}
      initialWorkstreams={workstreams}
    />

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
          {project.ssotUrl && <a className="button" href={project.ssotUrl} target="_blank" rel="noreferrer">Read SSOT</a>}
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
