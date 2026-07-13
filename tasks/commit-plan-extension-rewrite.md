# Commit plan: Parallel extension rewrite

## Commit policy

Every commit must be a coherent, reviewable checkpoint and use Conventional Commits. A commit may be created only when its scoped checks pass. Do not combine infrastructure, behavior changes, and legacy deletion merely to reduce commit count.

The executor may split a planned commit when the diff becomes difficult to review. It may not squash separate behavioral milestones during implementation.

## Planned sequence

## Execution notes

- Commits 03 and 04 are executed in reverse order. The legacy parser imports the VS Code runtime, while characterization must run in plain Node. The empty `packages/core` test/build scaffold is therefore established first; fixtures and behavioral tests still precede all new parsing implementation.

### 01. `docs(rewrite): define compatibility and execution contracts`

- Replace legacy planning material.
- Add the `.anl` compatibility contract, product baseline, architecture, PRD, commit plan, and goal contract.
- Record functional-core constraints and the Effect adoption gate.

Verification: Markdown links resolve, `biome check`, `eslint`, and `git diff --check` pass.

### 02. `build(repo): establish monorepo quality gates`

- Finalize pnpm workspaces, Node version, shared TypeScript config, Biome, ESLint, Lefthook, and Commitlint.
- Make test commands fail when no tests are discovered after the first test package is introduced.
- Align local and CI check scripts.

Verification: hook smoke tests, format, lint, typecheck, audit, and intentionally invalid commit-message test.

### 03. `test(core): capture legacy anl behavior`

- Add anonymized real-world and synthetic `.anl` fixtures.
- Add characterization expectations for valid output, recoverable invalid lines, and important diagnostics.
- Keep fixtures consumable by both legacy characterization helpers and the new core.

Verification: fixtures cover every construct in `docs/anl-compatibility.md`; tests fail against an intentionally broken expectation.

### 04. `build(core): scaffold functional core package`

- Create `packages/core` with public exports and strict TypeScript configuration.
- Add import-boundary enforcement.
- Add the core test project.
- Introduce no production classes.

Verification: core builds and tests without importing `vscode`, Axios, filesystem APIs, or extension code.

### 05. `feat(core): classify anl source lines`

- Implement source lines, source spans, comments, blank lines, dates, titles, entries, and tag classification.
- Return discriminated results rather than throwing for expected invalid input.

Verification: focused classifier tests and relevant characterization cases pass.

### 06. `feat(core): parse anl documents with recovery`

- Implement explicit immutable parser state and line transitions.
- Produce a serializable parsed document plus diagnostics.
- Recover after invalid lines when context permits.

Verification: complete fixture suite passes; parser tests contain no VS Code mocks.

### 07. `feat(core): add document queries and episode calculations`

- Add title, people, and tag queries.
- Add next-completed-episode calculation.
- Cover partial entries, repeated shows, ordering, dates, and midnight crossings.

Verification: domain/use-case tests and coverage report pass.

### 08. `experiment(effect): evaluate anime catalog boundary`

- Implement equivalent minimal catalog flows with stable Effect and with native Promise/AbortSignal, or document why a direct comparison is impractical.
- Measure bundle delta and compare typed errors, cancellation, timeout, retry, testing, and readability.
- Write an ADR accepting or rejecting Effect and delete the rejected prototype.

Verification: both candidates satisfy the same contract tests; ADR contains evidence and a clear decision.

### 09. `build(extension): scaffold vscode application package`

- Create `apps/vscode-extension` and its manifest.
- Bundle the declared entry point.
- Register activation/deactivation with explicit composition and disposal.
- Keep the legacy extension entry point unchanged until cutover.

Verification: compile, bundle inspection, activation test, and no singleton/global registry scan pass.

### 10. `feat(extension): add per-document parsing and diagnostics`

- Add document state keyed by URI.
- Parse on open/change with scheduling and stale-result protection.
- Map core diagnostics to VS Code diagnostics.

Verification: two-document isolation, edits, close/disposal, and diagnostic-range integration tests pass.

### 11. `feat(extension): add navigation and document insight`

- Add symbols, definitions, hovers, and only the code lenses justified by the PRD.
- Ensure providers use their supplied document rather than the active editor.

Verification: provider integration tests pass across multiple open documents.

### 12. `feat(extension): add local contextual completions`

- Add show, person, and tag completions from parsed document queries.
- Return an empty result when no completions exist.

Verification: context, ranking, ranges, Unicode, and stale-state tests pass.

### 13. `feat(extension): add resilient anime catalog search`

- Implement the catalog adapter using the accepted ADR direction.
- Add debounce, minimum query length, cancellation, timeout, rate limiting, and bounded cache.
- Keep remote failures isolated from local completion.

Verification: fake-transport tests cover success, cancellation, timeout, rate limiting, cache expiry, malformed response, and network failure.

### 14. `feat(extension): add date and time commands`

- Add injected clock formatting and editor edit adapters.
- Preserve the established two-step time flow and different-date confirmation.

Verification: fixed-clock, cancellation, cursor, multi-cursor policy, and integration tests pass.

### 15. `feat(extension): add next episode command`

- Resolve cursor context through the current document state.
- Insert the padded next completed episode without cross-document leakage.

Verification: missing context, partial episodes, repeated shows, padding, and two-document tests pass.

### 16. `feat(extension): add cross-platform contributions`

- Add grammar, commands, palette titles, and platform-specific shortcuts.
- Use `Cmd+Shift+D/T/N` on macOS and `Alt+D/T/N` elsewhere.
- Scope shortcuts to `.anl` editor contexts.

Verification: manifest contract test and manual macOS Extension Development Host smoke test pass.

### 17. `test(extension): add packaged vsix smoke coverage`

- Package the actual declared entry point and required assets.
- Inspect or install the VSIX in an isolated test environment.
- Add a manual release checklist.

Verification: clean install, activation, fixture open, primary workflow, and package-content checks pass.

### 18. `refactor(extension): cut over to rewritten implementation`

- Switch the production manifest entry point.
- Remove legacy `src`, obsolete configs, caches, scripts, and dependencies.
- Preserve `.anl` fixtures and compatibility docs.

Verification: full check, audit, VSIX smoke test, compatibility suite, and manual macOS workflow pass before commit.

### 19. `ci(release): validate rewritten extension`

- Make CI use the same immutable root checks.
- Test the supported Node/VS Code matrix justified by the manifest.
- Upload the VSIX artifact without automatically publishing it.

Verification: local workflow validation where available and green remote CI after push.

### 20. `docs(extension): document the rewritten workflow`

- Document installation, `.anl` syntax, commands, macOS shortcuts, development, architecture, testing, and release procedure.
- Resolve or explicitly retain every open PRD question.

Verification: documentation matches the final manifest/scripts and contains no legacy commands or paths.

## Merge and commit rules

- Never commit with failing scoped checks.
- Never bypass Lefthook or Commitlint to advance the plan.
- Do not commit generated VSIX, bundles, coverage, test downloads, or `node_modules`.
- An Effect rejection produces a valid ADR and the rewrite continues.
- Legacy deletion occurs only in commit 18 after parity and package smoke tests.
