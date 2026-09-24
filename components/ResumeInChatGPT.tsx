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
    `Project/idea: ${description}`,
    `Current status: ${currentStatus}`,
    `Recommended next step: ${nextStep}`,
    repo ? `Primary repository: ${repo}` : "",
    ...supportingLinks.map(link => `${link.label}: ${link.url}`),
    "",
    "Use prior project context and source-of-truth material before restarting analysis. Continue from the current state. Help me work on this now, making routine execution decisions without stopping unless the product direction would materially change.",
  ].filter(Boolean).join("\n");

  async function resume() {
    try {
      await navigator.clipboard.writeText(resumeBrief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 5000);
    } catch {
      setCopied(false);
    }

    const destination = chatgptProjectUrl || "https://chatgpt.com/";
    window.location.href = destination;
  }

  return (
    <div className="resume-actions">
      <button className="button primary-button resume-primary" type="button" onClick={resume}>
        Resume in ChatGPT
      </button>
      <p className="small resume-helper">
        {copied
          ? "Resume brief copied. Paste it into ChatGPT."
          : chatgptProjectUrl
            ? "Copies the re-entry brief and opens the registered ChatGPT project."
            : "Copies the re-entry brief and opens ChatGPT."}
      </p>
    </div>
  );
}
