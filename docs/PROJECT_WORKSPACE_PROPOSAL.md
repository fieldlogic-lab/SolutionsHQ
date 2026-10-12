# Connected project workspace — proposed scope

Status: implementation scope approved by the owner on 2026-10-12, including a private context database. This extends the AI Development Team pilot approved on the same date. Merge, deployment, publishing, acceptance of provider terms/charges, and engineering execution from a workshop message are not authorized by this scope approval.

## Product behavior

Every project detail page keeps its existing heading, status, workstreams, access links, and Resume in ChatGPT action. Add one workspace panel with four connected views using existing visual styles:

| View | Behavior | Execution authority |
| --- | --- | --- |
| Workshop | Persistent conversation for brainstorming, project design, and problem-solving. Decisions and requirements can be explicitly saved into project context. | Conversation and context storage only; no development tools. |
| Next Steps | Generate recommendations using project state, accepted decisions/requirements, discussions, outstanding work, and fresh development evidence. Show supporting context and uncertainty. | Recommendations only. |
| Prompt Builder | Turn selected discussion into an editable assignment containing objective, repository, context, scope/exclusions, constraints, acceptance criteria, tests, and unresolved questions. | Saves versioned draft assignments; no dispatch. |
| Development Team | Explicitly submit a reviewed assignment to Codex PM, approve the resulting scope, and track Developer work, checks, independent QA, and readiness. | Authenticated, approved dispatch only. No automatic merge/release/deploy. |

All projects receive these views. Development remains disabled for projects without an explicitly onboarded software repository; their discussions and assignments are still available. TriDrone remains the first live development target.

## Shared persistent context

Use one small private Postgres database accessed only through authenticated server routes. A managed database connected to the existing hosting project is the approved addition; no separate agent service, queue, vector database, or new microservice is needed. Provider terms/costs must be accepted by the owner before resource provisioning where required.

Suggested records:

- project events: project key, ordered revision, event type, timestamp, payload, author, source references, unique request key;
- conversations/messages: project key, thread ID, mode, role, content, model run state, source context revision;
- assignments: project key, immutable version, content hash, originating discussion/message IDs, context snapshot, draft/approved/submitted state, explicit approval record;
- development links: assignment version, GitHub request UUID/issue, workflow IDs, PR and full head SHA, verification/QA evidence references and freshness timestamps.

Store discussions and accepted decisions separately so an AI suggestion does not silently become a requirement. Preserve history; summaries aid retrieval but never replace original messages. Project keys are server-validated and every query is scoped to the authenticated owner and requested project. Writes use transactions and unique idempotency keys. User text and model output are always data, never executable routing or SQL.

Use optimistic revision checks for concurrent edits and server-enforced draft/approved/submitted transitions. Persist dispatch intent and confirmed/uncertain outcomes in a database record before contacting GitHub; reconcile uncertain outcomes against the existing GitHub UUID claims before retrying. This needs no additional queue service. A saved HQ decision records its source and approval but does not silently overwrite authoritative repository requirements; conflicts must be shown and explicitly reconciled.

For each AI operation, assemble the same context service output: curated project registry state, accepted decisions/requirements, relevant discussion history, current assignment versions, outstanding work, and recent linked development results. Include source IDs/revisions and timestamps. Bound model context through summaries and relevant selections while keeping the original history retrievable. Missing/stale GitHub evidence is explicitly labeled rather than invented.

On page refresh and across devices, views load persisted records. Workshop → Prompt Builder carries the discussion and source references automatically. Prompt Builder → Development carries the exact approved assignment snapshot; the user does not retype it. Development results are reconciled into the project context on status refresh using stable IDs, without duplicating events or losing prior findings.

Existing external ChatGPT history is not automatically available to a new API-backed application. Preserve current re-entry links and provide a deliberate import/paste-summary path for prior discussions unless an accessible source can be verified. Do not claim that previous external conversations have been imported.

## Engineering boundary

Workshop, Next Steps, and Prompt Builder use a conversational AI service with no GitHub write/dispatch tool. They cannot trigger code changes, PRs, deployments, or releases, regardless of text such as “implement this.” Their only handoff is a saved draft assignment and explicit navigation to review it.

Only the Development Team submission route may dispatch, and it requires a persisted approved assignment ID/version/hash for that project. Revisions revoke the old approval. Repository and workflow targets come from server-side onboarding configuration, not AI output. The existing PM exact-plan approval gate remains separate from assignment approval. User approval still controls merges, deployment, release dispatch, and publishing.

The conversational provider uses a server-only API key; database and GitHub credentials remain server-only. Do not expose private workshop content in public GitHub records. Before dispatch, show the exact assignment snapshot that will be sent to the target repository, including any discussion-derived content.

Bound context size, output size, and request runtime; validate structured recommendation/assignment responses. Use provider spending controls and configured usage limits. Interrupted or failed AI calls remain visibly incomplete and retryable without duplicating accepted messages. Include an authenticated project-context export/deletion path, documented retention, and a database backup/migration recovery procedure. Imported discussions are untrusted data and cannot grant execution permission.

## Acceptance and independent QA

1. A Workshop conversation persists after refresh and is available on a second session/device, with no cross-project leakage.
2. Next Steps uses the same context revision, acknowledges unavailable/stale development evidence, and does not initiate work.
3. A saved Workshop decision appears in Prompt Builder without re-entry; an edited draft remains editable and versioned.
4. An assignment is never dispatched without explicit approval of its exact version. Editing it invalidates approval. Replayed/concurrent submissions start at most one engineering request.
5. Workshop messages requesting implementation, merges, releases, or deployment cannot invoke execution. Automated tests verify there is no dispatch side effect.
6. A TriDrone assignment progresses through actual PM planning, separate scope approval, draft PR, automated checks, independent full-SHA QA, and owner-controlled final readiness.
7. Development evidence flows back into subsequent Workshop/Next Steps context with source links; new commits invalidate old QA readiness.
8. Existing navigation, Resume in ChatGPT, project links, and workstream controls remain usable on desktop/mobile. Owner access controls protect all private context.
9. Developer and independent QA remain separate agents; final QA identifies the exact reviewed commits. Live checks require configured credentials and explicitly approved activation/deployment.
10. Test concurrent edits, interrupted AI calls, ambiguous dispatch outcomes, malicious imported context, and revoked/expired owner sessions. Validate private export/deletion authorization and persistence migration recovery.

## Proposed implementation order

1. Shared context persistence, migration, owner authorization, and context service.
2. Workshop and Next Steps using read-only conversational AI calls and stored history.
3. Versioned Prompt Builder and explicit assignment approval.
4. Connect approved assignments to the existing development pilot and reconcile results back into context.
5. Automated boundary/persistence tests, independent QA, and a TriDrone end-to-end demonstration after owner-approved activation.
