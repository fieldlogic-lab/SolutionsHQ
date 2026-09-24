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

function isIOSDevice() {
  if (typeof navigator === "undefined") return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function nativeChatGPTUrl(webDestination: string) {
  try {
    const url = new URL(webDestination);

    if (url.hostname === "chatgpt.com" || url.hostname.endsWith(".chatgpt.com")) {
      return `com.openai.chat://${url.host}${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // Fall through to the generic native app launch.
  }

  return "com.openai.chat://chatgpt.com/";
}

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

    const webDestination = chatgptProjectUrl || "https://chatgpt.com/";

    if (!isIOSDevice()) {
      window.location.href = webDestination;
      return;
    }

    const nativeDestination = nativeChatGPTUrl(webDestination);
    let fallbackTimer: number | undefined;

    const cancelFallback = () => {
      if (fallbackTimer !== undefined) {
        window.clearTimeout(fallbackTimer);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", cancelFallback);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) cancelFallback();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", cancelFallback, { once: true });

    fallbackTimer = window.setTimeout(() => {
      cancelFallback();
      window.location.href = webDestination;
    }, 1500);

    window.location.href = nativeDestination;
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
            ? "Copies the re-entry brief and opens the registered ChatGPT project, preferring the iPhone app."
            : "Copies the re-entry brief and opens ChatGPT, preferring the iPhone app."}
      </p>
    </div>
  );
}
