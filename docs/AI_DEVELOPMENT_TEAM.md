# AI Development Team: setup and operation

SolutionsHQ remains the portfolio interface. GitHub issues preserve development requests; GitHub Actions runs real Codex agents in the target repository. No standalone worker service or database is required for this pilot.

The first enabled route is `hydrographic-usv` → `fieldlogic-lab/TriDroneUpgrades`. Other configured software projects display an onboarding state until their runner and project-specific checks are installed. Never infer a write target from request text.

## Activation order

1. Review and approve the TriDrone runner changes before merging them to its default `main` branch. The dispatcher calls `.github/workflows/ai-development.yml` on `main`; local files or a draft PR do not activate it.
2. Configure the GitHub Actions secret below and enable permitted Actions and draft PR creation in TriDrone.
3. Configure the SolutionsHQ server environment below. For local development, use an ignored `.env.local`. For hosting, enter values through the hosting provider's secret/environment interface. Do not use `NEXT_PUBLIC_` prefixes.
4. Review SolutionsHQ changes and separately approve deployment. Existing Vercel integration may create previews when branches or PRs are pushed and deploy production on main updates. Verify its actual settings before pushing.
5. Sign in through the AI Development Team panel on the TriDrone project page, submit the documentation-only request in `AI_TEAM_ACCEPTANCE.md`, review the PM plan, then approve its specific version.

Do not paste secret values into chat, source files, request text, issues, or PR descriptions.

## Secrets and permissions

| Location | Name | Purpose |
| --- | --- | --- |
| TriDrone GitHub repository → Settings → Secrets and variables → Actions | `OPENAI_API_KEY` | API access for PM, Developer, and independent QA Codex runs. Use a dedicated project key with a spending budget. |
| SolutionsHQ server environment | `AI_TEAM_GITHUB_TOKEN` | Fine-grained GitHub token restricted to TriDrone for this pilot: Metadata read, Contents read, Issues write, Actions write, Pull Requests read, Checks read. |
| SolutionsHQ server environment | `HQ_OWNER_PASSWORD` | Separate random owner password, at least 32 characters. |
| SolutionsHQ server environment | `HQ_SESSION_SECRET` | Separate random session signing secret, at least 32 characters. |
| SolutionsHQ server environment | `HQ_APP_ORIGIN` | Exact public origin, for example `https://solutions-hq.vercel.app`, without a trailing slash or path. Use the actual local origin when testing locally. Required for production writes; never infer it from forwarded headers. |
| SolutionsHQ server environment, optional | `GITHUB_TOKEN` | Existing read-only portfolio telemetry. Keep separate from the AI team token. |

Generate each owner secret separately with a password manager. Do not reuse the API key or GitHub token as the login password or signing secret. Rotate secrets through their provider interfaces.

In TriDrone Settings → Actions → General, permit the workflow's explicit permissions and enable **Allow GitHub Actions to create and approve pull requests** for draft PR creation. The runner creates draft PRs; it does not submit human approval reviews or merge them. Repository/organization policy may further restrict this setting. No signing or APK-release secrets are needed by the AI runner.

The login uses an HttpOnly, same-site signed session with expiration. Write routes check request origin. A fixed response delay is not a distributed login rate limiter; for a public deployment, configure hosting-provider protection/rate limiting on `/api/ai-team/session` before exposing the write surface. Keep a strong random password. The pilot supports one owner, not multi-user roles or account recovery.

## Approval and execution

Submission records a unique request ID and explicitly dispatches the planning phase. The UI distinguishes a saved request, accepted dispatch, actual runner activity, and integration failure. A GitHub issue alone is not evidence that Codex ran.

PM returns scope, acceptance criteria, and exact allowed paths. Approval is tied to the plan comment and SHA256 of its complete body. Developer runs in a separate process with the approved plan. Trusted orchestration validates generated changes before creating a branch and draft PR. Independent QA runs in a fresh job, checks the exact full PR head SHA, reruns Android checks, and publishes findings. New head commits invalidate previous QA.

The TriDrone pilot deliberately limits generated edits to approved individual files under `app/src/` and `docs/`. Requests needing workflow, build configuration, credential, or release changes require a separately reviewed engineering change. Trusted intake uses dedicated `solutionshq-requests/` and `solutionshq-phases/` Git tag refs as atomic request/phase claims, so concurrent dispatches cannot start duplicate agent work. These tracking refs do not create releases or change main. Each request phase is single-use; failed or uncertain dispatches need inspection before creating another request. There is no automatic retry loop or autonomous merge.

GitHub may require approval before automatically running PR workflows created by `GITHUB_TOKEN`. The AI workflow runs its own explicit Android verification and does not rely on those implicit PR triggers.

Merging, deployment, APK release dispatch, and publishing remain separate owner decisions. The integration provides no merge or release action. Keep repository protections enabled; AI QA is evidence, not a human approval or substitute for branch protection.

## Verification limits

Automated Android verification uses JDK 17, SDK platform/build tools 35, and Gradle 8.10.2:

```sh
gradle --no-daemon --continue :app:testDebugUnitTest :app:lintDebug :app:assembleDebug
```

These checks cannot verify Motorola installation, RS2+, HydroLite transport, actual RTK accuracy, field heading, survey datums, or real soundings. Hardware evidence remains separate. Debug compilation uses ordinary debug signing; no release signing, APK distribution, or public release is performed by this workflow.

See `AI_TEAM_ACCEPTANCE.md` for the first live request and required evidence. Until credentials are configured and an actual end-to-end run is observed, the live milestone is pending even if local tests pass.
