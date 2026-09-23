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
