# AI Development Team pilot acceptance

Scope approved by the owner on 2026-10-12: implement the SolutionsHQ request interface and TriDrone Codex runner, with separate scope and publishing approvals.

## First live request

Use the existing TriDrone project page (`/projects/hydrographic-usv`). Discuss this request in Workshop, carry it into Prompt Builder, review the exact assignment text and repository, approve that version, then explicitly submit it through Development Team:

> Add docs/AI_TEAM_PILOT.md describing the TriDrone PM → Developer → independent QA workflow, the required Android verification commands, and the hardware checks that CI cannot prove. Keep this change documentation-only and preserve existing product behavior. Do not merge, deploy, publish, or dispatch the APK release workflow.

Review the PM plan before approving it. Confirm that the only approved output path is `docs/AI_TEAM_PILOT.md`. Approval is for this plan version only.

Verify that the Workshop discussion, generated assignment, and later development evidence remain connected after reload and in a second authenticated session. Workshop messages alone must not dispatch either workflow phase.

## Evidence required

- An authenticated submission creates one durable request in `fieldlogic-lab/TriDroneUpgrades`.
- The request links to a real GitHub Actions run executing Codex; issue creation alone is insufficient.
- The run produces a PM plan and waits for owner scope approval.
- The approved plan produces one draft PR on a feature branch, with the request identifier visible in its tracking records.
- Independent QA checks out the full PR head SHA, independently runs relevant Android checks, and records pass/fail/blocked with findings and hardware limitations.
- SolutionsHQ shows the request after page refresh, the plan, run links, PR, validation results, and QA findings.
- Any later head commit invalidates the old QA conclusion.
- No merge, release, deployment, or public APK publication occurs.

## Failure and regression checks

- Reject unauthenticated writes, cross-origin writes, unknown projects, arbitrary target repositories, malformed IDs, and unconfigured integrations.
- Duplicate clicks and retry attempts must not silently start duplicate Developer runs.
- Show dispatch, failed/cancelled workflow, stale QA, and unavailable GitHub states honestly.
- Recheck Dashboard, Innovation Lab, existing project pages, repository links, Resume in ChatGPT, and workstream editing at desktop and mobile widths.

## Activation boundary

Local automated tests and independent code review cannot substitute for a live configured run. The live milestone remains pending until secrets are configured, the runner is approved and installed on the target default branch, and the SolutionsHQ interface is made available with separate deployment approval.

Never paste credentials into this document or chat. Record only run URLs, PR URLs, reviewed full SHAs, timestamps, and verification results.
