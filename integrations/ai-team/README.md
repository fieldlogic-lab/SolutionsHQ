# AI Development Team repository installation

`tridrone/` is the exact runner installation prepared for `fieldlogic-lab/TriDroneUpgrades`. Copy its `.github/workflows/ai-development.yml`, `scripts/ai-team/`, and `docs/SOLUTIONSHQ_AI_TEAM.md` into that repository on a reviewed feature branch. Its `android-pr.yml` preserves TriDrone's existing Android checks and adds the orchestration unit test step; merge that step into an existing validation workflow rather than replacing another project's CI. The files in SolutionsHQ are a reviewable installation template; their presence here does not activate a workflow in the target repository.

See `tridrone/docs/SOLUTIONSHQ_AI_TEAM.md` for API secret configuration, GitHub Actions draft PR permission, approval protocol, evidence, and operational limits. Workflow activation requires explicit owner approval to merge its installation into the target repository's default `main` branch. No workflow runs or secrets are created by copying this template.

For SurveyOS, HELM, SBU Coach, or another project:

1. Add an explicit backend project-to-repository mapping in SolutionsHQ. Keep repositories allowlisted and credentials server-only.
2. Copy this directory as a separate project installation. Change the `project` identity in `runner.py` intake and tests to the project's stable SolutionsHQ key.
3. Review and replace the static `allowed_path` policy and PM prompt path limits for that repository. Keep exact plan-approved filenames, reject workflow/build/deployment/credential/policy changes, and retain bounded manifest validation in the trusted publisher.
4. Replace the Android toolchain and independent check commands in the `build` job with the repository's documented checks. Update QA prompt language and operational documentation together. Never accept executable build commands from frontend request text.
5. Preserve isolated trusted intake/publisher/report jobs, atomic UUID claims, immutable artifact transfer, fresh Developer/QA agents, full-SHA stale QA checks, draft PRs, and final user approval. Never give model or generated-code jobs write credentials. Before enabling a web repository, inspect its hosting integration and push/PR workflows: branch creation or draft PRs must not automatically publish previews or releases without explicit owner approval. Disable automatic publishing or require a verified human deployment gate; withholding a deploy command alone is insufficient.
6. Run orchestration tests, review independently, and install via an owner-approved PR. Configure the repository's API key secret and Actions policy, then demonstrate a real request before enabling its project panel.

The TriDrone policy intentionally supports small source/docs work only. Requests needing Gradle, workflow, credentials, release, deployment, or broader infrastructure changes must be handled through separately reviewed engineering work; do not silently widen the allowed paths.
