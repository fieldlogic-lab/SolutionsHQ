"use client";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
type Preferences = { left: number; right: number; leftOpen: boolean; rightOpen: boolean };
const initial: Preferences = { left: 20, right: 29, leftOpen: true, rightOpen: true };
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export default function ProjectDesktopLayout({ left, right, children, showRight, focusRightKey }: { left: ReactNode; right: ReactNode; children: ReactNode; showRight: boolean; focusRightKey: number }) {
  const [preferences, setPreferences] = useState<Preferences>(initial);
  const [restored, setRestored] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ side: "left" | "right"; start: number; width: number; value: number } | null>(null);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("solutionshq-layout-v1") || "null");
      if (saved && typeof saved.left === "number" && typeof saved.right === "number" && Number.isFinite(saved.left) && Number.isFinite(saved.right) && typeof saved.leftOpen === "boolean" && typeof saved.rightOpen === "boolean") {
        setPreferences({ left: clamp(saved.left, 14, 28), right: clamp(saved.right, 23, 37), leftOpen: saved.leftOpen, rightOpen: saved.rightOpen });
      }
    } catch { /* Storage is optional; no project context is kept here. */ }
    setRestored(true);
  }, []);
  useEffect(() => { if (restored) { try { localStorage.setItem("solutionshq-layout-v1", JSON.stringify(preferences)); } catch { /* Private/history data is never written to localStorage. */ } } }, [preferences, restored]);
  useEffect(() => { if (showRight) setPreferences(current => ({ ...current, rightOpen: true })); }, [showRight, focusRightKey]);
  function resize(side: "left" | "right", value: number) { setPreferences(current => ({ ...current, [side]: clamp(value, side === "left" ? 14 : 23, side === "left" ? 28 : 37) })); }
  function start(event: PointerEvent<HTMLDivElement>, side: "left" | "right") {
    if (!container.current) return;
    dragging.current = { side, start: event.clientX, width: container.current.getBoundingClientRect().width, value: preferences[side] };
    event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault();
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const drag = dragging.current;
    if (!drag || !drag.width) return;
    resize(drag.side, drag.value + (event.clientX - drag.start) / drag.width * 100 * (drag.side === "left" ? 1 : -1));
  }
  function splitter(side: "left" | "right") {
    return <div className={`desktop-splitter desktop-splitter-${side}`} role="separator" tabIndex={0} aria-label={`Resize ${side === "left" ? "project navigation" : "development activity"} region`} aria-orientation="vertical" aria-valuemin={side === "left" ? 14 : 23} aria-valuemax={side === "left" ? 28 : 37} aria-valuenow={Math.round(preferences[side])} aria-valuetext={`${Math.round(preferences[side])}% of workspace`} onPointerDown={e => start(e, side)} onPointerMove={move} onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }} onKeyDown={e => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); resize(side, preferences[side] + (e.key === "ArrowRight" ? 2 : -2) * (side === "left" ? 1 : -1)); }
      if (e.key === "Home" || e.key === "End") { e.preventDefault(); resize(side, e.key === "Home" ? 0 : 100); }
    }} onLostPointerCapture={() => { dragging.current = null; }} />;
  }
  const style = { "--desktop-left": `${preferences.left}%`, "--desktop-right": `${preferences.right}%` } as CSSProperties;
  return <>
    <div className="desktop-layout-tools" aria-label="Desktop workspace layout"><button className="button secondary-button" aria-expanded={preferences.leftOpen} onClick={() => setPreferences(p => ({ ...p, leftOpen: !p.leftOpen }))}>{preferences.leftOpen ? "Hide" : "Show"} project navigation</button><button className="button secondary-button" onClick={() => setPreferences(p => ({ ...p, leftOpen: false, rightOpen: false }))}>Expand center</button><button className="button secondary-button" aria-expanded={preferences.rightOpen} onClick={() => setPreferences(p => ({ ...p, rightOpen: !p.rightOpen }))}>{preferences.rightOpen ? "Hide" : "Show"} development activity</button><button className="button secondary-button" onClick={() => setPreferences(initial)}>Reset layout</button></div>
    <div ref={container} style={style} className={`project-desktop ${preferences.leftOpen ? "desktop-left-open" : ""} ${preferences.rightOpen ? "desktop-right-open" : ""} ${showRight ? "mobile-development-open" : ""}`}>
      <aside className="desktop-left" aria-label="Project navigation and saved discussions">{left}</aside>{preferences.leftOpen && splitter("left")}
      <div className="desktop-center">{children}</div>{preferences.rightOpen && splitter("right")}
      <aside className="desktop-right" aria-label="Development activity and approvals">{right}</aside>
    </div>
  </>;
}
