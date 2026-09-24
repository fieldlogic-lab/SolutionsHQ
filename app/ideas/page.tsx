import Link from "next/link";
import { ideas } from "@/data/ideas";

export default function IdeasPage() {
  return <main className="detail mobile-detail">
    <Link className="back-link" href="/">← Dashboard</Link>

    <div className="mobile-page-heading">
      <div>
        <div className="eyebrow">Browse and resume</div>
        <h1>Innovation Lab</h1>
        <p className="detail-summary">Scroll ideas, open one, and jump straight into a working ChatGPT session.</p>
      </div>
    </div>

    <section className="idea-list">
      {ideas.map(idea => (
        <Link className="idea-card" href={`/ideas/${idea.slug}`} key={idea.slug}>
          <div className="idea-card-top">
            <div>
              <div className="name">{idea.name}</div>
              <p>{idea.description}</p>
            </div>
            <span className="badge">{idea.status}</span>
          </div>
          <div className="idea-next">
            <span className="eyebrow">Next</span>
            <strong>{idea.nextStep}</strong>
          </div>
          <div className="idea-card-footer">
            <span className="small">Updated {idea.lastUpdate}</span>
            <span className="resume-link">Resume →</span>
          </div>
        </Link>
      ))}
    </section>
  </main>;
}
