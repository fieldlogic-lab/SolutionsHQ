"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const mode = window.matchMedia("(display-mode: standalone)");
    const updateMode = () => setStandalone(mode.matches);
    const available = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const installed = () => { setPrompt(null); setStandalone(true); setShowHelp(false); };
    updateMode();
    mode.addEventListener("change", updateMode);
    window.addEventListener("beforeinstallprompt", available);
    window.addEventListener("appinstalled", installed);
    return () => {
      mode.removeEventListener("change", updateMode);
      window.removeEventListener("beforeinstallprompt", available);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  async function install() {
    if (!prompt) { setShowHelp(value => !value); return; }
    setBusy(true); setMessage("");
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setMessage(choice.outcome === "accepted" ? "Installation accepted. Use your browser’s app settings to create a desktop shortcut or pin it to the taskbar." : "Installation dismissed. You can install later from your browser menu.");
      setPrompt(null);
    } catch { setPrompt(null); setShowHelp(true); setMessage("Use your browser’s install option to continue."); }
    finally { setBusy(false); }
  }

  if (standalone) return null;
  return <div className="install-app">
    <button className="button secondary-button" type="button" onClick={() => void install()} disabled={busy} aria-expanded={showHelp} aria-controls="install-app-help">{busy ? "Opening installer…" : "Install app"}</button>
    {showHelp && <div className="install-app-help panel" id="install-app-help">
      <strong>Use Solutions HQ in its own window</strong>
      <p className="small">In Microsoft Edge or Chrome, use the address-bar install icon or the browser menu’s app installation option. On Windows, use the installed app’s settings to create a desktop shortcut and pin it to the taskbar.</p>
      <p className="small">On iPhone or iPad, use Safari’s Share menu → Add to Home Screen. An internet connection is required. Project context is shared through your signed-in account; layout preferences stay on each device.</p>
      <button type="button" className="button secondary-button" onClick={() => setShowHelp(false)}>Close</button>
    </div>}
    {message && <p className="small install-app-message" role="status">{message}</p>}
  </div>;
}
