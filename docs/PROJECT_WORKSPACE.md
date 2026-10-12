# Connected project workspace

SolutionsHQ keeps its existing portfolio pages, workstreams, project access links, and Resume in ChatGPT action. Each project now has a shared workspace with Workshop, Next Steps, Prompt Builder, and Development Team views. Project discussions are private owner data; target GitHub repositories remain authoritative for engineering requirements and development results.

## One project context, four views

Workshop saves conversation history and supports deliberately importing earlier discussions. Saving a decision or requirement is an explicit owner action; a suggestion does not become an accepted fact automatically. Next Steps recommends work using that same context and identifies missing or stale evidence. Prompt Builder carries selected discussions into an editable assignment with source references and a context revision. Development Team accepts only the exact approved assignment version and retains the separate Codex PM scope-approval gate.

Workshop, Next Steps, and Prompt Builder do not have execution tools. Text such as “implement this now” cannot create a branch, issue, PR, merge, release, or deployment. Only the explicitly approved Development Team submission route can dispatch the Codex planning workflow. Editing an assignment requires a new version and new approval. Approval to develop never authorizes merging, deploying, or publishing.

Every project has the conversational views, including projects without a software repository. Development dispatch is enabled only for explicitly onboarded repositories; TriDrone remains the pilot. Existing local workstream editing continues to work. Repository-defined workstreams and curated project status are sources in the shared context; browser-only edits are not silently represented as synchronized portfolio truth.

Existing external ChatGPT conversations are not automatically available to the application. Use the explicit import/paste-summary flow to preserve earlier context; no import is claimed until it is saved. Existing re-entry links remain available.

## Required private server configuration

Keep all values in the hosting provider's environment interface or ignored `.env.local`. Never use `NEXT_PUBLIC_` for these variables or paste credentials into chat, assignments, source code, or GitHub issues.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Connection string for one private Postgres database. Use a dedicated least-privileged application role, the provider's pooled connection URL where appropriate, and TLS as required by the provider. |
| `OPENAI_API_KEY` | Server-side conversational AI API access. This is separate from the repository Actions secret used by Codex runners. Use a dedicated API project with spending controls. |
| `HQ_AI_MODEL` | A Responses API text model available to that API project and supporting structured JSON output. Model access must be verified for the configured account. |
| `HQ_OWNER_PASSWORD` | Separate random owner password, at least 32 characters. |
| `HQ_SESSION_SECRET` | Separate random session signing secret, at least 32 characters. |
| `HQ_APP_ORIGIN` | Exact browser-facing origin, with no trailing slash or path. Public production origins must use HTTPS. |
| `AI_TEAM_GITHUB_TOKEN` | Server-only selected-repository token for approved development handoffs. See `AI_DEVELOPMENT_TEAM.md` for least-privilege permissions. |
| `GITHUB_TOKEN` | Optional separate read-only repository context/telemetry access. |

Missing database or AI configuration is reported as unavailable. The application does not silently replace durable context with browser memory or simulated AI responses.

## Database activation and recovery

1. Choose a private Postgres provider/account and accept its terms and any charges yourself. The Vercel connector available in this session returned 403 for integration configuration access, so no hosted database was provisioned automatically.
2. Connect the database to the intended SolutionsHQ hosting project and store `DATABASE_URL` as a server secret. There are two similarly named hosting projects; confirm the intended domain/project before adding secrets. Do not attach a production context database to an untrusted preview.
3. Run the documented `npm run db:migrate` command with `DATABASE_URL` available to the script. Confirm the database/schema is correct before running any migration. The initial migration creates only the namespaced workspace tables and records its version; it does not drop existing project data.
4. Run automated tests and a production build, then obtain separate deployment approval. A Git push or PR may create a Vercel preview; do not assume a review branch is deployment-free.
5. Verify a discussion survives reload and another authenticated session before relying on the deployment for project history.

Back up the private database before subsequent schema migrations. Enable the chosen provider's backup/point-in-time recovery if supported by the selected plan. Test restore into a separate database and application environment. Roll back a failed application deployment to the previously approved version; restore data only from a verified backup when needed. Never test recovery by dropping the production database.

Private context remains stored until the owner exports/deletes it or the database is removed under the provider's retention policy. Export/deletion applies only to the requested authenticated project. Deletion does not remove GitHub issues, PRs, external API/provider backups, or minimal development UUID/outcome and deleted-operation UUID tombstones needed to prevent unsafe replay or late-response restoration. These tombstones contain no discussion or assignment text. Review provider backup and API retention policies separately when deleting sensitive history.

## Handoff and verification

Before submitting development, review the exact assignment text and repository destination. Only this approved assignment should be copied into the repository request; private discussion history must not be attached implicitly. A public target repository makes the submitted assignment public. The context revision, source references, immutable assignment version, and hash preserve provenance within HQ.

Dispatch intent is saved before contacting GitHub. An uncertain network result is not evidence that nothing ran; refresh/reconcile existing GitHub records before attempting recovery. Repository UUID claims prevent duplicate agent execution. Do not delete claim refs or bypass branch protection to retry.

Repository instructions are read at a known commit when available. Unavailable instructions, build commands, or development evidence remain unresolved. Independent QA applies only to the reviewed full PR head SHA; new commits make earlier build/QA readiness stale. Results feed back into project context as timestamped observations with source links, not rewritten history.

The local automated suite exercises real Postgres-compatible SQL using test-only PGlite, including persistence and concurrent revision checks. This is not evidence of a live managed database, successful paid API response, or activated Codex workflow. Live acceptance still requires configured services and the owner-approved TriDrone demonstration in `AI_TEAM_ACCEPTANCE.md`.
