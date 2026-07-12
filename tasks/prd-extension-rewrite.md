# PRD: Parallel rewrite of Marucs' Anime

## Introduction

Rewrite the VS Code extension as a two-workspace TypeScript monorepo. The replacement must preserve the existing `.anl` user experience while separating a pure, reusable core from VS Code and external services. The current implementation remains available as a behavioral oracle until the new extension passes parity checks.

## Goals

- Open existing `.anl` files without migration or automatic modification.
- Make domain and parsing logic testable without loading VS Code.
- Preserve syntax intelligence, anime discovery, and date/time/episode workflows.
- Provide usable default keyboard shortcuts on macOS.
- Produce one deterministic, inspectable VSIX artifact.
- Establish a core that future web and server applications can consume.

## User stories

### US-001: Establish reproducible repository tooling

**Description:** As a maintainer, I want one package manager and reproducible checks so that every later change has a trustworthy baseline.

**Acceptance criteria:**

- [ ] The repository uses a pinned Node version and a single pnpm lockfile.
- [ ] Obsolete npm/Yarn lockfiles and unused test dependencies are removed.
- [ ] Formatting, lint, typecheck, unit test, integration test, build, and package scripts have unambiguous names.
- [ ] Tests fail when no tests are discovered.
- [ ] Dependency audit findings are documented or resolved according to runtime exposure.
- [ ] CI invokes the same non-mutating checks used locally.
- [x] Biome, type-aware ESLint, Lefthook, and Commitlint are installed at the repository root.
- [x] Conventional Commit messages are enforced by the `commit-msg` hook.
- [x] Runtime dependency audit reports no high or critical vulnerability at the planning baseline.

### US-002: Scaffold the two-workspace monorepo

**Description:** As a maintainer, I want isolated core and extension workspaces so that dependency boundaries are enforceable.

**Acceptance criteria:**

- [ ] `packages/core` builds and tests without `vscode` installed as a runtime dependency.
- [ ] `apps/vscode-extension` consumes core through its public package exports.
- [ ] Import-boundary checks reject VS Code, HTTP, filesystem, and storage imports from core.
- [ ] The legacy implementation remains runnable during the parallel rewrite.

### US-003: Capture legacy `.anl` behavior

**Description:** As an existing user, I want my current files to remain valid after the rewrite.

**Acceptance criteria:**

- [ ] Representative anonymized legacy files are committed as fixtures.
- [ ] Fixtures cover dates, Unicode titles, watch entries, company, tags, partial episodes, comments, whitespace, repetition, invalid lines, and midnight crossings.
- [ ] Expected parsed data and important diagnostics are asserted.
- [ ] Opening a fixture does not modify its contents.

### US-004: Implement the editor-neutral parser

**Description:** As an application developer, I want plain-text parsing in core so that the same rules can run outside VS Code.

**Acceptance criteria:**

- [ ] The parser accepts a string and returns a serializable model plus typed diagnostics.
- [ ] Diagnostics contain editor-neutral source spans.
- [ ] Invalid lines allow safe recovery and later valid lines are processed.
- [ ] Core parser tests do not import or mock VS Code.
- [ ] Characterization fixtures pass.

### US-005: Implement domain calculations

**Description:** As a user, I want episode and session calculations to match my history.

**Acceptance criteria:**

- [ ] Next episode equals the last completed episode plus one.
- [ ] Partial `--` entries do not advance the completed episode.
- [ ] Repeated shows across dates contribute to the same show history.
- [ ] Time and date values are validated without relying on ambient locale.
- [ ] Midnight-crossing behavior is explicitly tested.

### US-006: Compose a disposable extension application

**Description:** As a maintainer, I want explicit application composition so that providers do not depend on global state.

**Acceptance criteria:**

- [ ] Activation constructs dependencies and returns or registers all disposables.
- [ ] No singleton or mutable module-level registry coordinates the application.
- [ ] State is isolated per document URI and removed on close.
- [ ] Activation does not erase workspace state.
- [ ] Activation and deactivation integration tests pass.

### US-007: Restore live parsing and diagnostics

**Description:** As a user, I want feedback while editing so that invalid history is easy to correct.

**Acceptance criteria:**

- [ ] `.anl` documents parse on open and after debounced relevant edits.
- [ ] Core diagnostics map to accurate VS Code ranges and severities.
- [ ] Diagnostics from one document never appear on another.
- [ ] Network availability does not affect parsing.
- [ ] A documented large fixture meets the agreed interactive performance budget.

### US-008: Restore editor navigation and insight

**Description:** As a user, I want symbols, definitions, hovers, and useful lenses so that large histories remain navigable.

**Acceptance criteria:**

- [ ] Document symbols list shows at their source positions.
- [ ] Definition from a repeated show resolves to its first declaration.
- [ ] Hover information is derived from the current parsed document.
- [ ] Retained code lenses have tested commands and do not depend on the active editor when a document is supplied.

### US-009: Restore local completions

**Description:** As a user, I want contextual suggestions from my document while typing.

**Acceptance criteria:**

- [ ] Show-title completion ranks recently mentioned local titles.
- [ ] Company completion works inside `{}`.
- [ ] Tag completion works inside `[]` and includes legacy built-ins.
- [ ] Completion returns no item rather than a malformed placeholder when there are no matches.
- [ ] Stale document results are not returned after edits.

### US-010: Add resilient anime catalog search

**Description:** As a user, I want to discover anime titles without leaving the editor.

**Acceptance criteria:**

- [ ] The core defines an editor-neutral anime search port.
- [ ] The extension adapter maps external DTOs to a small internal result type.
- [ ] Requests are debounced, cancellable, rate-limited, and bounded by timeout and response size.
- [ ] Cache size and lifetime are bounded.
- [ ] HTTP errors preserve local completion and produce no uncaught rejection.
- [ ] Adapter tests use a fake server or transport and do not call the live API.

### US-011: Restore date and time commands

**Description:** As a user, I want quick date and time insertion during a watch session.

**Acceptance criteria:**

- [ ] Date inserts as `DD/MM/YYYY` using an injected clock.
- [ ] Time inserts as `HH:MM` and supports the established start/end sequence.
- [ ] Insertion under a different date asks for confirmation.
- [ ] Cancellation leaves the document unchanged.
- [ ] Cursor and multiple-selection behavior is explicitly tested.

### US-012: Restore next-episode insertion

**Description:** As a user, I want one action to insert the next completed episode number.

**Acceptance criteria:**

- [ ] The command resolves the show from the cursor's document context.
- [ ] It inserts last completed episode plus one, padded to at least two digits.
- [ ] It handles absent show context without modifying the document.
- [ ] It never reads state from another open document.

### US-013: Provide cross-platform shortcuts

**Description:** As a macOS user, I want shortcuts that do not conflict with Option-based character entry.

**Acceptance criteria:**

- [ ] macOS contributes `Cmd+Shift+D`, `Cmd+Shift+T`, and `Cmd+Shift+N` for date, time, and next episode.
- [ ] Windows/Linux retain `Alt+D`, `Alt+T`, and `Alt+N` equivalents.
- [ ] Shortcuts are limited to relevant `.anl` editor contexts.
- [ ] All actions remain available from the Command Palette and can be rebound.

### US-014: Package and smoke-test the replacement

**Description:** As a maintainer, I want the distributable artifact to match the tested implementation.

**Acceptance criteria:**

- [ ] The manifest points to the generated replacement entry point.
- [ ] Packaging fails when required grammar, assets, or runtime files are missing.
- [ ] A smoke test installs or inspects the VSIX and activates it against a fixture.
- [ ] The artifact excludes source maps, tests, coverage, legacy code, and development-only dependencies unless intentionally included.

### US-015: Cut over and remove the legacy implementation

**Description:** As a maintainer, I want one production implementation after parity is proven.

**Acceptance criteria:**

- [ ] All characterization, unit, integration, and packaging tests pass against the replacement.
- [ ] Manual smoke tests cover Windows/Linux bindings and macOS bindings.
- [ ] The manifest activates only the replacement.
- [ ] Legacy source, obsolete caches, deprecated classes, unused dependencies, and obsolete scripts are removed.
- [ ] User documentation describes installation, `.anl` syntax, commands, shortcuts, and known limitations.

## Functional requirements

- FR-1: The replacement must read existing `.anl` files without migration.
- FR-2: Parsing must be deterministic and independent of VS Code.
- FR-3: A malformed line must not prevent recovery of later valid lines when context permits.
- FR-4: The extension must provide live syntax highlighting and diagnostics.
- FR-5: The extension must provide local contextual completion and resilient external anime search.
- FR-6: Date, time, and next-episode actions must remain available through commands and shortcuts.
- FR-7: Default macOS shortcuts must use `Cmd+Shift+D/T/N`.
- FR-8: The next episode must ignore partial entries.
- FR-9: Network, cache, and editor integrations must be adapters outside core.
- FR-10: Per-document state must not leak across open editors.
- FR-11: The shipped VSIX must load the same entry point validated by CI.
- FR-12: Legacy code must remain available until replacement parity is verified.

## Non-goals

- Building the SaaS, backend, frontend, authentication, synchronization, or database.
- Designing an incompatible successor to `.anl`.
- Preserving command IDs, cache serialization, internal classes, folder names, or exact diagnostic prose.
- Maintaining both implementations after cutover.
- Automating Marketplace publication before the replacement has a manual release checklist.

## Technical considerations

- Use pnpm workspaces and TypeScript project references or an equivalently enforceable package boundary.
- Implement `packages/core` as a functional core: immutable data, plain functions, discriminated unions, and explicit state transitions. Production classes are prohibited in core unless an ADR demonstrates a concrete interoperability requirement.
- Prefer `type` aliases in core. Interfaces are acceptable at external framework boundaries, especially when implementing VS Code provider contracts.
- Keep synchronous parsing, validation, document queries, and episode calculations independent from Effect.
- Run a time-boxed Effect spike at an asynchronous boundary, initially the anime catalog adapter. Compare typed failures, cancellation, retry, timeout, testing ergonomics, bundle impact, and readability before adopting Effect elsewhere.
- Do not copy T3Code's Effect 4 beta or class-based `Context.Service`/`TaggedErrorClass` patterns without an explicit ADR. Use a stable Effect release for the spike.
- Select supported dependency versions during implementation rather than copying versions from the legacy plan.
- Prefer Node APIs or a small fetch-based adapter over a large HTTP dependency when requirements permit.
- Keep TextMate grammar behavior aligned with parser fixtures; grammar highlighting and semantic validation are separate concerns.
- Profile before selecting an incremental parsing strategy.

## Success metrics

- All selected real-world legacy fixtures parse without migration.
- Core has zero runtime dependency on VS Code and can be imported by a plain Node test.
- Every required workflow has automated coverage at the lowest practical layer.
- No test command succeeds with zero discovered tests.
- No known high or critical production dependency vulnerability remains at release.
- The packaged extension activates and completes the primary workflow on macOS.

## Execution phases

1. Baseline and characterization: US-001 and US-003.
2. Monorepo and core: US-002, US-004, and US-005.
3. Extension shell and live analysis: US-006 through US-008.
4. Completion, catalog, and commands: US-009 through US-013.
5. Packaging and cutover: US-014 and US-015.

Each phase ends with a reviewable, green checkpoint. Cutover is prohibited until phases 1 through 4 meet their acceptance criteria.

## Core programming model

- Domain values are readonly structural types.
- Expected failures are discriminated unions or typed Effect failures at asynchronous boundaries.
- Parser state is an immutable value passed through pure transition functions.
- Factories are plain functions and are introduced only when they validate or normalize input.
- No singleton, service locator, mutable module registry, inheritance hierarchy, or repository abstraction without persistence exists in core.
- Core tests call functions directly and do not construct dependency containers.

## Effect adoption gate

Effect is not a prerequisite for the parser. The spike is accepted only when it demonstrates at least two material improvements over a Promise/AbortSignal implementation and does not force Effect types into pure domain entities. If the spike is rejected, the rewrite continues without Effect; rejection is not a blocker for the goal.

## Open questions

- Which anonymized real `.anl` files should become compatibility fixtures?
- Which legacy code lenses are genuinely useful enough to preserve?
- What document size should define the interactive parsing performance budget?
- Should external anime search be automatic while typing or explicitly invoked after a minimum query length?
