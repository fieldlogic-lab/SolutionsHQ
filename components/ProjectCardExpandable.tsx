"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/data/projects";

export default function ProjectCardExpandable({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className={`project-card-shell${expanded ? " is-expanded" : ""}`}>
      <div className="card project-card-row">
        <div className="project-card-title">
          <div className="name">{project.name}</div>
          <div className="small">{project.description}</div>
        </div>

        <div className="project-card-badges">
          <span className="badge">{project.status}</span>
          <span className="badge">{project.stage}</span>
        </div>

        <div className="project-card-status">
          <div>{project.currentStatus}</div>
          <div className="small">Updated {project.lastUpdate}</div>
        </div>

        <div className="project-card-actions">
          <Link className="resume-link" href={`/projects/${project.slug}`}>
            Resume →
          </Link>
          <button
            className="project-expand-button"
            type="button"
            aria-expanded={expanded}
            aria-controls={`project-details-${project.slug}`}
            onClick={() => setExpanded(value => !value)}
          >
            {expanded ? "Collapse" : "Details"}
            <span aria-hidden="true">{expanded ? " ↑" : " ↓"}</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="project-card-drawer" id={`project-details-${project.slug}`}>
          <div className="project-drawer-primary">
            <span className="eyebrow">Next Action</span>
            <strong>{project.nextStep}</strong>
          </div>

          <div className="project-drawer-links">
            <Link className="button primary-button" href={`/projects/${project.slug}`}>
              Open Project
            </Link>
            {project.repo && (
              <a className="button" href={project.repo} target="_blank" rel="noreferrer">
                Repository
              </a>
            )}
            {project.app && (
              <a className="button" href={project.app} target="_blank" rel="noreferrer">
                Open App
              </a>
            )}
            {project.supportingLinks?.map(link => (
              <a className="button secondary-button" href={link.url} target="_blank" rel="noreferrer" key={link.url}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
