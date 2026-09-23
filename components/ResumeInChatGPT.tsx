"use client";

import { useState } from "react";

type ResumeInChatGPTProps = {
  name: string;
  description: string;
  currentStatus: string;
  nextStep: string;
  repo?: string;
  supportingLinks?: { label: string; url: string }[];
  chatgptProjectUrl?: string;
};

export default function ResumeInChatGPT({
  name,
  description,
  currentStatus,
  nextStep,
  repo,
  supportingLinks = [],
  chatgptProjectUrl,
}: ResumeInChatGPTProps) {
  const [copied, setCopied] = useState(false);

  const resumeBrief = [
    `Resume work on ${name}.`,
    "",
    `Project: ${description}`,
    `Current status: ${currentStatus}`,
    `Recommended next step: ${nextStep}`,
    repo ? `Primary repository: ${repo}` : "",
    ...supportingLinks.map(link => `${link.label}: ${link.url}`),
    "",
    "Before changing anything, review the project's source-of-truth documents and latest repository state. Continue from the current state rather than restarting or redesigning established decisions. Make routine execution decisions without stopping for confirmation unless the product direction would materially change.",
  ].filter(Boolean).join("\n");

  async function resume() {
    const destination = chatgptProjectUrl || "https://chatgpt.com/";
    window.open(destination, "_blank", "noopener,noreferrer");

    try {
      await navigator.clipboard.writeText(resumeBrief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 5000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="resume-actions">
      <button className="button primary-button" type="button" onClick={resume}>
        Resume in ChatGPT
      </button>
      <p className="small">
        {copied
          ? "Resume brief copied. Paste it into the project chat that just opened."
          : chatgptProjectUrl
            ? "Opens the registered ChatGPT project and copies a current re-entry brief."
            : "Opens ChatGPT and copies a current re-entry brief. A project-specific ChatGPT link can be registered later."}
      </p>
    </div>
  );
}
