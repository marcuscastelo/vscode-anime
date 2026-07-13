# Goal contract: Rewrite Marucs' Anime

## Objective

Execute `tasks/prd-extension-rewrite.md` through a parallel, test-driven rewrite, following `tasks/commit-plan-extension-rewrite.md`, until the new VS Code extension preserves the documented `.anl` experience, passes automated and manual acceptance checks, and replaces the legacy implementation.

## Required inputs

Before changing code, read:

1. `AGENTS.md`
2. `docs/anl-compatibility.md`
3. `docs/product-behavior.md`
4. `docs/target-architecture.md`
5. `tasks/prd-extension-rewrite.md`
6. `tasks/commit-plan-extension-rewrite.md`
7. This goal contract

## Execution rules

- Work in commit-plan order unless evidence requires reordering; document any reordering before implementation.
- Preserve the legacy implementation as a behavioral reference until the cutover commit.
- Start each behavior with a failing or characterization test at the lowest useful layer.
- Keep `packages/core` functional and independent from VS Code and infrastructure.
- Prefer plain functions, readonly types, object literals, and discriminated unions.
- Treat Effect as a gated experiment, not a predetermined architecture.
- Verify each commit scope before committing and use Conventional Commits.
- After each checkpoint, update PRD checkboxes and record evidence in the commit or relevant ADR.
- Continue autonomously through ordinary implementation decisions covered by the PRD.

## Definition of done

The goal is complete only when all of the following are true:

- Every PRD story and functional requirement is implemented or explicitly removed by user-approved PRD change.
- Existing selected `.anl` fixtures require no migration and pass compatibility tests.
- Core contains no production classes unless backed by an accepted ADR.
- Core has no VS Code, HTTP-client, filesystem, editor, or workspace-storage dependency.
- Date, time, next episode, parsing, diagnostics, local completion, anime search, navigation, and shortcuts satisfy their acceptance tests.
- macOS uses `Cmd+Shift+D/T/N` and the primary workflow has been manually validated in an Extension Development Host.
- The packaged VSIX loads its declared entry point and passes the smoke checklist.
- Format, lint, typecheck, unit tests, coverage policy, VS Code integration tests, build, package checks, and production audit pass.
- Legacy implementation and obsolete dependencies are removed after parity.
- Final documentation describes the repository that actually ships.
- Git working tree contains no unintended or generated changes.

## Continue conditions

The goal must continue when:

- A test fails and the failure can be diagnosed locally.
- Lint, formatting, typecheck, build, coverage, or packaging fails because of work in scope.
- The implementation is difficult, a dependency API is unfamiliar, or a prototype must be revised.
- The Effect spike is rejected; record the ADR and continue with the native alternative.
- A planned commit must be split to remain reviewable.
- A legacy behavior is surprising but can be captured safely with a characterization test.
- A flaky test can be reproduced or made deterministic with controlled time, I/O, scheduling, or fixtures.

## Pause and request user direction

Pause before proceeding when:

- Preserving observed legacy behavior conflicts with the written `.anl` compatibility contract and either choice changes user files or visible semantics.
- A required real-world `.anl` fixture cannot be anonymized or accessed and synthetic fixtures cannot establish compatibility confidently.
- A decision would expand scope into SaaS, database persistence, authentication, synchronization, or a new syntax version.
- Marketplace publication, credentials, secrets, paid services, or irreversible external actions become necessary.
- Manual validation requires a platform or VS Code environment unavailable to the executor and no equivalent automated evidence exists.
- Repository state contains overlapping user changes that cannot be preserved safely.
- A dependency license or unresolved production vulnerability makes release unsafe and replacing it materially changes scope.

When pausing, report the exact checkpoint, evidence gathered, viable options, and recommended option. Do not mark the goal complete.

## Failure escalation and blocked condition

- Attempt diagnosis, a scoped fix, and one materially different alternative before treating the same condition as an impasse.
- Do not loop by repeating the same command or patch without new evidence.
- Mark the goal blocked only after the same external/user-dependent blocker has persisted for three goal turns and no meaningful in-scope progress remains.
- Local technical failures are not blockers while another diagnostic or implementation path remains.

## Immediate stop conditions

Stop work immediately, preserve evidence, and request direction if:

- Continuing risks deleting or overwriting user-authored `.anl` data.
- A command would require destructive Git history changes or discarding unknown user work.
- Credentials or private data appear in fixtures, logs, generated artifacts, or proposed commits.
- Tests demonstrate that cutover would silently reinterpret valid legacy documents.
- The requested action requires authority beyond this repository or the explicit task scope.

## Successful termination

After satisfying the definition of done:

1. Run the complete verification suite from a clean checkout-equivalent state.
2. Summarize delivered behavior, architectural decisions, Effect ADR outcome, test/coverage evidence, audit result, VSIX smoke evidence, and remaining non-goal work.
3. Mark the goal complete only when no required work remains.
