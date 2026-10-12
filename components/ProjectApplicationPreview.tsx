"use client";
import { useEffect, useState } from "react";
import { projectPreview } from "@/lib/project-preview";

export default function ProjectApplicationPreview({ name, registeredUrl, selfProject }: { name: string; registeredUrl?: string; selfProject: boolean }) {
  const [origin, setOrigin] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const eligible = projectPreview(registeredUrl, origin, selfProject);
  return <div className="workspace-application-preview">
    {!eligible.url ? <p className="small">{eligible.reason}</p> : <>
      <div className="ai-actions"><button className="button secondary-button" disabled={!origin} aria-expanded={open} aria-controls="workspace-application-frame" onClick={() => setOpen(value => !value)}>{open ? "Close application preview" : "Preview application here"}</button><a className="button secondary-button" href={eligible.url} target="_blank" rel="noopener noreferrer">Open application separately</a></div>
      {open && <><p className="small">This restricted preview loads the registered application only after you request it. Some apps block embedding or require browser features unavailable here. If the frame is blank or blocked, open the application separately; embedding is not confirmed by this preview.</p><iframe id="workspace-application-frame" title={`${name} application preview`} src={eligible.url} sandbox="allow-scripts allow-forms" referrerPolicy="no-referrer" loading="lazy" className="workspace-preview-frame" /></>}
    </>}
  </div>;
}
