"use client";

import Link from "next/link";
import { useState } from "react";
import ResumeInChatGPT from "@/components/ResumeInChatGPT";
import type { Project, ProjectWorkstream } from "@/data/projects";

function fallbackWorkstreams(project: Project): ProjectWorkstream[] {
  return [
    {
      label: "Ship Next",
      title: "Move the current ship target forward",
      nextStep: project.nextStep,
      status: "Ready",
    },
    {
      label: "Blockers",
      title: "Clear the highest-impact blocker",
      nextStep: "Review the current project state, identify the single biggest blocker to shipping, and remove it without expanding scope.",
      status: "Ready",
    },
    {
      label: "Project State",
      title: "Reconcile the source of truth",
      nextStep: "Compare the current implementation, repository, and source-of-truth material; update the working plan around what is actually true now.",
      status: "Ready",
    },
  ];
}

function workstreamPrompt(project: Project, workstream: ProjectWorkstream) {
  return [
    `Continue work on ${project.name}, specifically the "${workstream.label}" workstream.`,
    "",
    `Project: ${project.description}`,
    `Current project status: ${project.currentStatus}`,
    `Current ship target: ${project.nextStep}`,
    `Workstream objective: ${workstream.title}`,
    `Immediate next step: ${workstream.nextStep}`,
    project.repo ? `Primary repository: ${project.repo}` : "",
    project.ssotUrl ? `Source of truth: ${project.ssotUrl}` : "",
    ...(project.supportingLinks ?? []).map(link => `${link.label}: ${link.url}`),
    "",
    "Use prior project context and source-of-truth material before restarting analysis. Work on this task now. Stay inside this workstream unless another area must change to make it function, and prefer the smallest shippable increment.",
  ].filter(Boolean).join("\n");
}

export default function ProjectCardExpandable({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const workstreams = project.workstreams?.length ? project.workstreams : fallbackWorkstreams(project);

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
            Open →
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
            <span className="eyebrow">What do you want to work on?</span>
            <div className="project-drawer-workstreams">
              {workstreams.map(workstream => (
                <div className="project-drawer-workstream" key={workstream.label}>
                  <div className="project-drawer-workstream-copy">
                    <strong>{workstream.label}</strong>
                    <span>{workstream.title}</span>
                    <p>{workstream.nextStep}</p>
                  </div>
                  <ResumeInChatGPT
                    name={project.name}
                    description={project.description}
                    currentStatus={project.currentStatus}
                    nextStep={workstream.nextStep}
                    repo={project.repo}
                    supportingLinks={project.supportingLinks}
                    chatgptProjectUrl={project.chatgptProjectUrl}
                    buttonLabel={`Work on ${workstream.label}`}
                    promptOverride={workstreamPrompt(project, workstream)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="project-drawer-links">
            <Link className="button primary-button" href={`/projects/${project.slug}`}>
              Open Full Project
            </Link>
            {project.ssotUrl && (
              <a className="button" href={project.ssotUrl} target="_blank" rel="noreferrer">
                Read SSOT
              </a>
            )}
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
