import Link from "next/link";
import { notFound } from "next/navigation";
import ResumeInChatGPT from "@/components/ResumeInChatGPT";
import { ideas } from "@/data/ideas";

export default async function IdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idea = ideas.find(i => i.slug === slug);
  if (!idea) notFound();

  return <main className="detail mobile-detail">
    <Link className="back-link" href="/ideas">← Innovation Lab</Link>

    <div className="project-heading">
      <div>
        <div className="eyebrow">Innovation Lab</div>
        <h1>{idea.name}</h1>
        <p className="detail-summary">{idea.description}</p>
      </div>
      <div className="project-badges">
        <span className="badge">{idea.status}</span>
      </div>
    </div>

    <section className="panel resume-panel mobile-resume-panel">
      <div>
        <div className="eyebrow">Next move</div>
        <h2>{idea.nextStep}</h2>
      </div>
      <ResumeInChatGPT
        name={idea.name}
        description={idea.description}
        currentStatus={`Innovation Lab status: ${idea.status}. Last meaningful update: ${idea.lastUpdate}.`}
        nextStep={idea.nextStep}
      />
    </section>

    <section className="panel idea-detail-panel">
      <div className="eyebrow">Current idea</div>
      <p>{idea.description}</p>
      <div className="small">Last meaningful update: {idea.lastUpdate}</div>
    </section>
  </main>;
}
