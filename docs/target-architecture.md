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
      diagnostics/
      domain/
      parsing/
      use-cases/
      ports/
    test/
      fixtures/
docs/
tasks/
```

The first rewrite needs exactly two workspaces. Future web and server applications may consume `packages/core`, but placeholders for them are unnecessary.

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
VS Code API ──> apps/vscode-extension ──> packages/core
HTTP client ──> catalog adapter ────────> core port
Storage API ──> cache adapter ──────────> core port
Clock ────────> command adapter ────────> core use case
```

`packages/core` cannot import `vscode`, Axios, filesystem APIs, workspace storage, or extension manifest types. It exposes values and use cases that accept plain data and explicit dependencies.

## Core responsibilities

- Tokenize, parse, and validate `.anl` text.
- Represent shows, watch sessions, watch entries, tags, people, dates, and times.
- Calculate the next completed episode.
- Produce editor-neutral diagnostics and source spans.
- Define ports for anime search and optional cache/storage behavior.

The core does not know about editors, completion items, code lenses, hover Markdown, status bars, or keybindings.

## Extension responsibilities

- Activate and dispose VS Code registrations.
- Translate editor documents into core inputs.
- Translate core spans and diagnostics into VS Code types.
- Implement commands using `WorkspaceEdit` or editor edits.
- Implement providers and schedule debounced full-document parsing with stale-result protection.
- Adapt the anime catalog and clock. No workspace cache is currently necessary.

## State and composition

Activation creates one explicit application object. Dependencies are constructed once and passed to commands and providers. Per-document state is keyed by document URI and disposed on close. No module-level mutable registries or singleton accessors are allowed.

The parser is deterministic: equal text and configuration produce equal output. Caches may improve performance but cannot change results.

## Testing strategy

1. Characterization fixtures freeze legacy `.anl` behavior.
2. Core unit tests cover grammar, recovery, validation, and calculations without VS Code mocks.
3. Contract tests cover the catalog adapter and its cache policy.
4. VS Code integration tests cover activation, commands, diagnostics, providers, and manifest contributions.
5. Packaging smoke tests install or inspect the VSIX and load its declared entry point.

Coverage is a guardrail, not the objective. Start with meaningful tests and raise enforced thresholds by migration phase; `passWithNoTests` is forbidden.

## Completed migration

- The workspaces and characterization suite were built alongside the untouched legacy implementation.
- The manifest switched only after parity, VSIX inspection, Extension Host integration, and manual macOS smoke testing.
- Legacy code, dependencies, and obsolete scripts were then deleted in a separate cutover commit.

## Current decisions

The core uses structural readonly values and discriminated results. The catalog uses native `fetch`, `AbortSignal`, explicit policies, and an in-memory bounded cache. Documents are reparsed after a 75 ms debounce; a 10,000-entry parser regression test enforces a one-second upper budget. Effect was rejected for this extension in [ADR 0001](adr/0001-effect-adoption.md).
