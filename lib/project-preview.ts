/** Eligibility for a curated registry URL, never a user-entered or AI-provided URL. */
export function projectPreview(registeredUrl: string | undefined, currentOrigin: string, selfProject = false): { url: string | null; reason: string } {
  if (!registeredUrl) return { url: null, reason: "No application preview is configured for this project." };
  try {
    const url = new URL(registeredUrl);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password) return { url: null, reason: "Inline previews require a registered HTTPS application URL without credentials." };
    if (host === "chatgpt.com" || host.endsWith(".chatgpt.com") || host === "chat.openai.com" || host.endsWith(".chat.openai.com")) return { url: null, reason: "ChatGPT companion conversations open separately; they cannot be embedded here." };
    if (selfProject || currentOrigin && url.origin === new URL(currentOrigin).origin) return { url: null, reason: "SolutionsHQ cannot preview itself inside its own workspace." };
    return { url: url.href, reason: "" };
  } catch { return { url: null, reason: "The registered application URL is unavailable for inline preview." }; }
}
