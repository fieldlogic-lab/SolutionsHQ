"use client";

import { useEffect, useMemo, useState } from "react";
import ResumeInChatGPT from "@/components/ResumeInChatGPT";
import type { ProjectWorkstream, ProjectWorkstreamStatus } from "@/data/projects";

type EditableWorkstream = ProjectWorkstream & {
  id: string;
  archived?: boolean;
};

type WorkstreamManagerProps = {
  project: {
    slug: string;
    name: string;
    description: string;
    currentStatus: string;
    nextStep: string;
    repo?: string;
    ssotUrl?: string;
    supportingLinks?: { label: string; url: string }[];
    chatgptProjectUrl?: string;
  };
  initialWorkstreams: ProjectWorkstream[];
};

const statuses: ProjectWorkstreamStatus[] = ["Ready", "In Progress", "Blocked", "Shipped"];

function makeId(label: string, index: number) {
  return `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workstream"}-${index}`;
}

export default function WorkstreamManager({ project, initialWorkstreams }: WorkstreamManagerProps) {
  const storageKey = `solutions-hq:workstreams:${project.slug}`;
  const [workstreams, setWorkstreams] = useState<EditableWorkstream[]>(() =>
    initialWorkstreams.map((item, index) => ({ ...item, id: makeId(item.label, index) }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setWorkstreams(JSON.parse(saved));
    } catch {
      // Keep repository-defined defaults if local persistence is unavailable.
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(workstreams));
    } catch {
      // Editing remains usable for the current session.
    }
  }, [hydrated, storageKey, workstreams]);

  const visibleWorkstreams = useMemo(
    () => workstreams.filter(item => showArchived || !item.archived),
    [showArchived, workstreams]
  );

  function updateWorkstream(id: string, patch: Partial<EditableWorkstream>) {
    setWorkstreams(items => items.map(item => item.id === id ? { ...item, ...patch } : item));
  }

  function addWorkstream(formData: FormData) {
    const label = String(formData.get("label") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const nextStep = String(formData.get("nextStep") || "").trim();
    if (!label || !title || !nextStep) return;

    setWorkstreams(items => [
      ...items,
      {
        id: `custom-${Date.now()}`,
        label,
        title,
        nextStep,
        status: "Ready",
      },
    ]);
    setShowAdd(false);
  }

  function resetToProjectDefaults() {
    setWorkstreams(initialWorkstreams.map((item, index) => ({ ...item, id: makeId(item.label, index) })));
    setEditingId(null);
    setShowArchived(false);
  }

  return (
    <section className="panel workstreams-panel">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Parallel workstreams</div>
          <h2>Choose a productive path</h2>
        </div>
        <div className="workstream-toolbar">
          <button className="button secondary-button" type="button" onClick={() => setShowAdd(value => !value)}>
            {showAdd ? "Cancel" : "Add workstream"}
          </button>
          <button className="button secondary-button" type="button" onClick={() => setShowArchived(value => !value)}>
            {showArchived ? "Hide archived" : "Show archived"}
          </button>
        </div>
      </div>

      <p className="small workstream-storage-note">
        Edits are saved on this device. Repository-defined defaults remain available as a reset point.
      </p>

      {showAdd && (
        <form className="workstream-editor workstream-add-form" action={addWorkstream}>
          <label>
            <span>Workstream</span>
            <input name="label" placeholder="e.g. GIS" required />
          </label>
          <label>
            <span>Objective</span>
            <input name="title" placeholder="What this branch is trying to accomplish" required />
          </label>
          <label className="wide-field">
            <span>Next step</span>
            <textarea name="nextStep" rows={3} placeholder="Smallest useful action that moves this branch forward" required />
          </label>
          <button className="button primary-button" type="submit">Add workstream</button>
        </form>
      )}

      <div className="workstream-grid">
        {visibleWorkstreams.map(workstream => {
          const prompt = [
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
            "Read the relevant source-of-truth material before making changes. Stay inside this workstream unless another area must change to make it function. Prefer the smallest shippable increment and preserve unrelated behavior.",
          ].filter(Boolean).join("\n");

          const isEditing = editingId === workstream.id;

          return (
            <article className={`workstream-card${workstream.archived ? " is-archived" : ""}`} key={workstream.id}>
              <div className="workstream-card-head">
                <div>
                  <span className="badge">{workstream.archived ? "Archived" : workstream.status}</span>
                  <h3>{workstream.label}</h3>
                </div>
                <button className="project-expand-button" type="button" onClick={() => setEditingId(isEditing ? null : workstream.id)}>
                  {isEditing ? "Done" : "Edit"}
                </button>
              </div>

              {isEditing ? (
                <div className="workstream-editor compact-editor">
                  <label>
                    <span>Status</span>
                    <select
                      value={workstream.status}
                      onChange={event => updateWorkstream(workstream.id, { status: event.target.value as ProjectWorkstreamStatus, archived: false })}
                    >
                      {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Objective</span>
                    <input value={workstream.title} onChange={event => updateWorkstream(workstream.id, { title: event.target.value })} />
                  </label>
                  <label>
                    <span>Next step</span>
                    <textarea rows={4} value={workstream.nextStep} onChange={event => updateWorkstream(workstream.id, { nextStep: event.target.value })} />
                  </label>
                  <div className="workstream-edit-actions">
                    <button className="button" type="button" onClick={() => updateWorkstream(workstream.id, { status: "Shipped", archived: false })}>
                      Mark shipped
                    </button>
                    <button className="button secondary-button" type="button" onClick={() => updateWorkstream(workstream.id, { archived: !workstream.archived })}>
                      {workstream.archived ? "Restore" : "Archive"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <strong>{workstream.title}</strong>
                  <p className="small">{workstream.nextStep}</p>
                  {!workstream.archived && (
                    <ResumeInChatGPT
                      name={project.name}
                      description={project.description}
                      currentStatus={project.currentStatus}
                      nextStep={workstream.nextStep}
                      repo={project.repo}
                      supportingLinks={project.supportingLinks}
                      chatgptProjectUrl={project.chatgptProjectUrl}
                      buttonLabel={`Work on ${workstream.label}`}
                      promptOverride={prompt}
                    />
                  )}
                </>
              )}
            </article>
          );
        })}
      </div>

      <div className="workstream-reset-row">
        <button className="project-expand-button" type="button" onClick={resetToProjectDefaults}>
          Reset workstreams to project defaults
        </button>
      </div>
    </section>
  );
}
