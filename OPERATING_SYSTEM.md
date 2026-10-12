# Solutions HQ — Operating System

## Purpose
Solutions HQ is the human interface for the Massi Solutions portfolio. It is not the source of truth for every project; it is the command and re-entry layer above those sources.

## Core Principles
1. **Accessible over elaborate.** The dashboard must answer what is active, where it stands, and how to resume it.
2. **One product on the surface, modular underneath.**
3. **Project truth stays with the project.** GitHub repositories and project SSOT files remain authoritative.
4. **HQ indexes; it does not compete.**
5. **Current status + next step are mandatory for active projects.**
6. **Status is simple.** Active, Inactive, Parked, Complete.
7. **Stage is lightweight.** Idea, Explore, Build, Launch, Operate.
8. **Progress is optional.** Do not force a percentage onto early ideation.
9. **Ideation must remain low-friction.** Ideas can live indefinitely without being promoted.
10. **Promote only when useful.** A promising idea can become a formal project without requiring every idea to do so.
11. **Durable state beats browser state.** Important state must eventually live in durable storage.
12. **Integrations fail independently.** One unavailable service must not break HQ.
13. **Automation proposes; the human decides consequential transitions.**
14. **Re-entry is a first-class feature.** A project page should make it possible to resume work after months away.

## v1 Screens
- Dashboard
- Project Detail
- Innovation Lab

## v1 Project Fields
- Name
- Description
- Status
- Stage
- Optional progress
- Last update
- Current status
- Next step
- Repository/application links

## v1 Idea Fields
- Name
- Description
- Status
- Last update
- Next step

## Deferred
Authentication, database-backed editing, automatic GitHub synchronization, Drive integration, automated checkpoints, AI resume packets, notifications, multi-user roles, and commercialization analytics.

### AI Development Team pilot exception
Single-owner authentication and explicit GitHub workflow dispatch are included for the AI Development Team write surface. Existing portfolio pages and local workstreams remain available. The target repository owns request records and development evidence. Repositories are onboarded explicitly with their own checks; no agent receives merge, deployment, or release authorization from scope approval. See `docs/AI_DEVELOPMENT_TEAM.md` for configuration and activation boundaries.

### Connected project workspace and desktop
Workshop, Next Steps, Prompt Builder, and Development Team share private, durable project context. Accepted HQ decisions retain provenance and cannot silently overwrite repository truth. Only an exact approved assignment can enter engineering; a workshop conversation alone cannot dispatch work. The same application serves mobile and an installable Windows PWA, with larger-screen regions and a separate ChatGPT companion. Private context lives on the server; device storage retains only existing workstream edits and layout preferences. See `docs/PROJECT_WORKSPACE.md` and `docs/DESKTOP_PWA.md`.


## Invention / Patent-Readiness Discipline
When a project may contain protectable technical subject matter, Solutions HQ must classify it in the patent-readiness register and apply the invention-record standard in `docs/INVENTION_RECORD_STANDARD.md`.

At minimum:
- preserve dated technical versions;
- preserve contributors and specific contributions;
- preserve sketches/CAD/photos/tests/BOM changes;
- maintain a disclosure log;
- distinguish reconstructed history from contemporaneous records;
- flag external demonstration, offer for sale, public testing, licensing discussion, or publication as filing-review checkpoints.

Git history supports the record but does not replace formal patent filing.
