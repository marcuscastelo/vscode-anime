# Marucs' Anime

Marucs' Anime is a VS Code extension for recording anime watch history in portable, human-readable `.anl` files. The repository is a pnpm monorepo with a functional editor-neutral core and a thin VS Code application.

## Install

Install the published extension from the VS Code Marketplace, or build a local VSIX with:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm package
pnpm package:verify
```

Then run **Extensions: Install from VSIX...** and select `artifacts/marucs-anime.vsix`.

## `.anl` syntax

```anl
12/07/2026

Frieren:
20:00 - 20:24 01
20:25 - 20:49 02 {marcus, friend} [REWATCH]
20:50 - 21:00 -- // partial entries do not advance the episode
```

Dates use `DD/MM/YYYY`, show titles end in `:`, and watch entries use `HH:MM - HH:MM EPISODE`. `--` marks a partial entry. Company is comma-separated inside `{}`, tags use `[]`, and `//` starts a comment. Existing files need no migration; see the complete [compatibility contract](docs/anl-compatibility.md).

## Editor features

- Syntax highlighting and live diagnostics.
- Document symbols, definition navigation, and hover history.
- Local completion for shows, people, and legacy tags.
- Resilient Jikan catalog search with debounce, cancellation, timeout, rate limiting, and bounded cache.
- Commands for the current date, start/end time, and next completed episode.

| Action | Command Palette | Windows/Linux | macOS |
| --- | --- | --- | --- |
| Insert date | Marucs' Anime: Insert Current Date | `Alt+D` | `Cmd+Shift+D` |
| Insert time | Marucs' Anime: Insert Current Time | `Alt+T` | `Cmd+Shift+T` |
| Insert next episode | Marucs' Anime: Insert Next Episode | `Alt+N` | `Cmd+Shift+N` |

Shortcuts apply only to focused `.anl` editors and can be rebound. Editing commands intentionally require one empty cursor selection. Catalog failures never disable local completion or document parsing.

## Development

Node 22+ and pnpm 10.12.1 are required.

```sh
pnpm check             # format, lint, types, unit tests, build
pnpm test:coverage
pnpm test:integration  # real VS Code Extension Host
pnpm package
pnpm package:verify
pnpm audit:production
```

`packages/core` contains pure parsing, domain values, diagnostics, and queries. It has no VS Code, Node-only, HTTP, storage, or persistence dependency. `apps/vscode-extension` owns all editor, clock, network, packaging, and activation adapters. See [target architecture](docs/target-architecture.md), the [Effect decision](docs/adr/0001-effect-adoption.md), and the [release checklist](docs/release-checklist.md).

## Scope and limitations

This rewrite does not include accounts, synchronization, persistence, a SaaS backend, or automatic Marketplace publication. Code lenses were not retained: symbols, definitions, hover, completion, and explicit commands cover the useful legacy workflows with less UI noise and less coupling.
