# SolutionsHQ development process

- Project Manager defines scope and acceptance criteria and obtains the owner's scope approval before substantial implementation.
- Use separate Developer and independent QA agents. Developers work on feature branches, add appropriate coverage, and prepare draft pull requests. QA independently reviews the diff and reruns relevant checks.
- Record the full reviewed commit SHA. Any later commit requires renewed QA; developer self-review is not independent QA.
- Only the owner authorizes merging, deploying, releasing, or publishing. Scope approval does not authorize these actions. Never push directly to main.
- Preserve existing navigation, design, project links, and local workstream behavior. Read OPERATING_SYSTEM.md and DECISION_LOG.md before architectural changes.
- Keep project truth in the target repository. AI Development Team routing must be explicit and allowlisted; never accept arbitrary repositories or workflow refs from request text.
- Keep credentials in server environment variables or GitHub Actions secrets. Never expose credentials through frontend code, responses, logs, generated patches, or agent prompts.
- Treat agent output as untrusted input. Trusted orchestration must validate it before creating branches, PRs, comments, or status transitions.
- Run automated tests, TypeScript validation, and the production build for application changes. Independently verify authorization, scope approval, dispatch failures, duplicate submissions, and stale QA behavior for development-team changes.
- The existing Vercel integration may deploy on Git activity. Verify deployment behavior before pushing a branch or opening a PR; obtain separate owner deployment approval where required.
