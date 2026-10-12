# Target architecture

## Repository shape

```text
apps/
  vscode-extension/
    src/
      activation/
      catalog/
      clock/
      commands/
      completion/
      diagnostics/
      documents/
      providers/
    test/
      integration/
packages/
  core/
    src/
      model.ts
      playback.ts
      history.ts
    test/
  anl-adapter/
    src/
      diagnostics/
      domain/
      parsing/
      use-cases/
      history-reader.ts
    test/
      fixtures/
docs/
tasks/
```

The extraction has three workspaces: domain core, ANL adapter and VS Code application. Future UI, MCP, CLI and browser inputs may consume `packages/core`; placeholders for them are unnecessary. The [watching history contract](watch-history-core.md) supersedes the document-oriented core boundary of the earlier rewrite.

## Repository tooling

- pnpm workspaces manage the root, `apps/*`, and `packages/*` with one lockfile.
- Node 22 is the minimum runtime during the rewrite.
- Biome owns formatting, import organization, and fast syntax-level lint rules.
- ESLint owns type-aware TypeScript rules and enforceable architectural boundaries. Formatting rules and duplicate import-order plugins do not belong in ESLint.
- Lefthook formats and lints staged files, Commitlint validates Conventional Commit messages, and the full non-mutating check runs before push.
- CI must run the same `check` command without relying on Git hooks.

The legacy implementation was removed only after characterization, integration, package, and manual macOS parity checks passed. All production TypeScript now receives the strict policy.

## Dependency direction

```text
VS Code API ──> apps/vscode-extension ──> packages/anl-adapter ──> packages/core
Future UI / MCP / CLI / browser inputs ───────────────────────> packages/core
File / database / API implementation ────────────────────────> HistoryStorage port
```

`packages/core` imports only its own domain modules. It exposes readonly observations, pure playback transitions, episode progress and the input/storage ports. It knows neither files nor text, source spans, tags, documents, editor commands, network clients or manifests.

## Core responsibilities

- Record manual watching observations: what, when, completion and company.
- Accept `play`, `pause`, `position` and `end` observations with subsecond positions.
- Project session state and observed playing time without guessing unwitnessed playback.
- Calculate completed-episode progress from plain observations.
- Read and append through `HistoryStorage`, preserving state across recreation.

## ANL adapter responsibilities

- Classify, parse and validate `.anl` text, returning recovered documents and typed diagnostics.
- Own tags, source spans and document-context queries.
- Translate manual entries to the core's location-free observations and delegate episode rules to core.
- Implement the read port through an injected text reader, without importing files or VS Code.

## Extension responsibilities

- Activate and dispose VS Code registrations.
- Pass editor text into the ANL adapter and translate spans/diagnostics into VS Code types.
- Implement commands, providers and debounced parsing with document isolation.
- Save the existing `.anl` through the editor, retaining syntax and behavior.
- Adapt clock and anime catalog; these integrations do not belong to the watching domain.

## State and composition

Activation creates one explicit application object. Dependencies are constructed once and passed to commands and providers. Per-document state is keyed by document URI and disposed on close. No module-level mutable registries or singleton accessors are allowed.

The parser is deterministic: equal text and configuration produce equal output. Caches may improve performance but cannot change results.

## Testing strategy

1. Characterization fixtures freeze legacy `.anl` behavior.
2. Core tests cover watching transitions and the storage port without VS Code mocks; ANL tests cover grammar, recovery, diagnostics and document queries.
3. Contract tests cover the catalog adapter and its cache policy.
4. VS Code integration tests cover activation, commands, diagnostics, providers, and manifest contributions.
5. Packaging smoke tests install or inspect the VSIX and load its declared entry point.

Coverage is a guardrail, not the objective. Start with meaningful tests and raise enforced thresholds by migration phase; `passWithNoTests` is forbidden.

## Completed migration

- The workspaces and characterization suite were built alongside the untouched legacy implementation.
- The manifest switched only after parity, VSIX inspection, Extension Host integration, and manual macOS smoke testing.
- Legacy code, dependencies, and obsolete scripts were then deleted in a separate cutover commit.

## Current decisions

The core uses structural readonly values, pure transitions, a closure with private service state and discriminated results. No production classes or new framework are introduced. The catalog uses native `fetch`, `AbortSignal`, explicit policies, and an in-memory bounded cache. Documents are reparsed after a 75 ms debounce; a 10,000-entry parser regression test enforces a one-second upper budget. Effect was rejected for this extension in [ADR 0001](adr/0001-effect-adoption.md).
