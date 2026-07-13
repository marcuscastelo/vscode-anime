# Repository instructions

## Mission

Rewrite Marucs' Anime as a testable monorepo while preserving the user-visible `.anl` experience. The current implementation is a behavioral reference, not an architectural template.

## Source of truth

Read these documents before changing behavior:

- `docs/anl-compatibility.md`: compatibility contract for `.anl` files.
- `docs/product-behavior.md`: user-visible extension behavior.
- `docs/target-architecture.md`: package boundaries and dependency rules.
- `tasks/prd-extension-rewrite.md`: ordered requirements and acceptance criteria.
- `tasks/commit-plan-extension-rewrite.md`: required implementation and commit sequence.
- `tasks/goal-extension-rewrite.md`: autonomous execution, continuation, pause, and stop rules.

When code and documentation disagree, do not silently choose one. Add a characterization test for the observed behavior and document the decision.

## Rewrite constraints

- Preserve existing `.anl` files without migration.
- Preserve user-visible capabilities, not internal command IDs, cache formats, class names, or folder structure.
- Keep `packages/core` independent from `vscode`, Node-only APIs, HTTP clients, and persistence implementations.
- Keep the VS Code API inside `apps/vscode-extension`.
- Prefer explicit dependency injection and pure functions. Do not introduce global mutable state or service locators.
- Model expected parse and validation failures as typed values, not thrown exceptions.
- Keep domain values immutable unless mutation is measurably necessary.
- Treat the legacy code as read-only once the parallel implementation starts. Delete it only after parity tests pass.

## Required workflow

1. Identify the PRD story being implemented.
2. Add or update characterization, unit, or integration tests first.
3. Implement the smallest coherent change.
4. Run formatting, lint, typecheck, unit tests, extension integration tests, build, and packaging checks relevant to the change.
5. Update documentation when a contract or architectural decision changes.

Do not weaken assertions, coverage thresholds, compiler strictness, or lint rules merely to make a check pass.

## Testing boundaries

- Core unit tests must not mock VS Code because core must not import VS Code.
- Parser tests use plain strings and stable snapshots or explicit typed results.
- Adapter tests may use fakes for time, anime search, storage, and editor operations.
- VS Code integration tests cover activation, commands, providers, diagnostics, and macOS-specific keybinding contributions.
- Every bug fix requires a regression test.

## Compatibility policy

Compatibility covers syntax, parsing, diagnostics that affect normal workflows, completion/search, and date/time/next-episode actions. Compatibility does not cover command identifiers, workspace cache contents, logs, deprecated classes, or undocumented implementation quirks.

## Git hygiene

- Do not mix infrastructure migration, behavioral changes, and legacy deletion in one commit.
- Do not commit generated bundles, coverage output, downloaded VS Code binaries, or VSIX files.
- Never modify unrelated user changes.
