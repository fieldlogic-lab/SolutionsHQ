# Solutions HQ

Solutions HQ is the portfolio and innovation command center for Massi Solutions.

It exists to make projects accessible, show where work stands, preserve re-entry context, and provide a lightweight home for ideas before they become projects.

## v1

- Dashboard of active/inactive projects
- Status, stage, optional progress, last update, current state, next step
- Project detail/re-entry pages
- Innovation Lab idea registry
- Direct links to authoritative project systems

See `OPERATING_SYSTEM.md`, `DECISION_LOG.md`, and `docs/IMPLEMENTATION_PLAN.md` before changing architecture.

## Connected project workspace and desktop PWA

Every project includes Workshop, Next Steps, Prompt Builder, and Development Team views sharing private persistent context. Engineering starts only from an explicitly approved assignment and approved Codex PM scope. Existing portfolio navigation, workstreams, and ChatGPT companion handoffs remain available.

- [Private context, AI setup, and migrations](docs/PROJECT_WORKSPACE.md)
- [Codex runner configuration and approval gates](docs/AI_DEVELOPMENT_TEAM.md)
- [Windows PWA installation and responsive desktop workspace](docs/DESKTOP_PWA.md)
- [First live TriDrone acceptance request](docs/AI_TEAM_ACCEPTANCE.md)

Run `npm ci`, `npm test`, and `npm run build` for local verification. Configure private server variables from `.env.example` and run `npm run db:migrate` before using persistent workspace features. The same online application supports mobile and Windows installation; it does not register an offline service worker. Deployment, merging, and publishing require owner approval.
