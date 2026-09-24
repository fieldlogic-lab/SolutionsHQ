# Decision Log

## 2026-09-23 — Establish Solutions HQ
**Decision:** Create a dedicated Solutions HQ application as the portfolio, re-entry, and innovation command layer for Massi Solutions.

**Reason:** GitHub provides durable project repositories but does not provide the cross-project interface needed to see status, resume work, or manage early ideas.

## 2026-09-23 — Brand the system as Solutions HQ
**Decision:** The product and interface are named **Solutions HQ**. “Massi Solutions” describes the portfolio/company context, not the application brand.

## 2026-09-23 — Keep v1 status simple
**Decision:** Use only Active, Inactive, Parked, and Complete for project status. Use Idea, Explore, Build, Launch, and Operate for lightweight stage context.

**Reason:** The portfolio is currently founder-operated and does not need granular workflow administration.

## 2026-09-23 — Do not force percent-complete tracking
**Decision:** Solutions HQ will emphasize status, current state, and next work. Percent complete is not required for project cards.

**Reason:** Early and iterative work does not benefit from false precision.

## 2026-09-23 — Preserve project authority
**Decision:** HQ is an index and command interface. GitHub and each project's source-of-truth documents remain authoritative.

## 2026-09-23 — Build around re-entry
**Decision:** Every project page must prioritize current state, next step, and direct access to its working systems.

## 2026-09-23 — Resume in ChatGPT
**Decision:** Project pages include a **Resume in ChatGPT** action.

The v1 behavior:
- assemble a re-entry brief from the project's current status, next step, and registered working links;
- copy that brief to the clipboard;
- open ChatGPT;
- use a registered project-specific ChatGPT URL when a stable one is available.

**Reason:** Solutions HQ should direct the user back into productive work, not merely describe project status. The implementation must avoid inventing or depending on an unverified ChatGPT Project deep-link format.


## 2026-09-23 — Party Chief is a standalone project
**Decision:** Party Chief is a full standalone Massi Solutions project and must receive its own authoritative repository.

**Reason:** The product has already progressed through concept development, product architecture, prototype planning, customer/channel definition, commercialization strategy, and a concrete prototype-to-proof validation path. The planned 3D printer is an execution accelerator, not the threshold that makes Party Chief a project.

**Repository target:** `fieldlogic-lab/PartyChief`

Party Chief graduated to its dedicated repository on 2026-09-23. The former incubator package was migrated and replaced with a pointer.


## 2026-09-23 — Standardize invention records
**Decision:** Solutions HQ maintains a portfolio-wide invention-record standard and patent-readiness register.

Projects with plausible protectable technical subject matter receive version, contributor, disclosure, and evidence tracking. Party Chief and WorkZone Thumper have active invention records; AutoDock is active; Hydrographic USV is on watch until a genuinely novel architecture emerges.

**Reason:** Ordinary Git history is useful but does not by itself capture inventorship contributions, public disclosures, technical version rationale, failed designs, or filing-review triggers.


## 2026-09-23 — Make mobile browse/resume a first-class workflow
**Decision:** Solutions HQ mobile UX prioritizes browsing projects and ideas, opening a detail page, and resuming work in ChatGPT.

**Behavior:**
- project and idea lists use tap-friendly cards;
- project/idea detail pages surface the next move prominently;
- ideas have their own re-entry pages;
- Resume in ChatGPT copies a current re-entry brief and opens ChatGPT;
- desktop detail remains available without sacrificing the mobile flow.

**Reason:** Solutions HQ should be useful from a phone as a lightweight re-entry launcher, not only as a desktop portfolio dashboard.


## 2026-09-24 — Prefer native ChatGPT on iPhone
**Decision:** On iOS, Resume in ChatGPT should attempt to hand work off to the native ChatGPT app before using the browser.

**Behavior:**
- copy the current project/idea re-entry brief;
- attempt the native ChatGPT app route;
- preserve any registered ChatGPT destination when it can be mapped safely;
- fall back to the normal web URL if native handoff is unavailable;
- retain normal browser behavior on non-iOS devices.

**Reason:** Solutions HQ is intended to be a mobile re-entry launcher. Opening Safari when the user already works in the ChatGPT iPhone app adds friction and breaks the intended browse → resume workflow. The fallback remains necessary because the external deep-link surface is not a documented stable API.
