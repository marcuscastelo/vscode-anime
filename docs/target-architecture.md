# Target architecture

## Repository shape

```text
apps/
  vscode-extension/
    src/
      activation/
      commands/
      providers/
      diagnostics/
      adapters/
    test/
      integration/
packages/
  core/
    src/
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

The legacy `src/` tree is excluded from the new lint policy because it is a read-only behavioral reference. New code under `apps/` and `packages/` receives the strict policy immediately.

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
- Implement providers and schedule incremental parsing.
- Adapt the anime catalog, workspace cache, logging, and clock.

## State and composition

Activation creates one explicit application object. Dependencies are constructed once and passed to commands and providers. Per-document state is keyed by document URI and disposed on close. No module-level mutable registries or singleton accessors are allowed.

The parser is deterministic: equal text and configuration produce equal output. Caches may improve performance but cannot change results.

## Testing strategy

1. Characterization fixtures freeze legacy `.anl` behavior.
2. Core unit tests cover grammar, recovery, validation, and calculations without VS Code mocks.
3. Contract tests cover catalog and cache adapters.
4. VS Code integration tests cover activation, commands, diagnostics, providers, and manifest contributions.
5. Packaging smoke tests install or inspect the VSIX and load its declared entry point.

Coverage is a guardrail, not the objective. Start with meaningful tests and raise enforced thresholds by migration phase; `passWithNoTests` is forbidden.

## Migration strategy

- Scaffold the workspaces alongside the untouched legacy `src/` implementation.
- Build the core and characterization suite first.
- Implement the extension shell and adapters against the core.
- Compare both implementations on the same fixtures.
- Switch the manifest entry point only after parity and manual smoke testing.
- Delete legacy code, obsolete dependencies, and obsolete scripts in a separate final phase.

## Architectural decisions to record later

Remaining choices such as workspace build orchestration, schema validation, result types, HTTP client, and incremental parse algorithm should be captured as short ADRs when selected during implementation. They are deliberately not locked by this plan without benchmarks or prototypes.
