# Marucs' Anime

Marucs' Anime records what was watched, when, and how far playback progressed. Its domain core is independent of editors, text formats and storage implementations. The VS Code extension is the current input adapter and keeps the portable, human-readable `.anl` workflow.

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

The workspaces have separate responsibilities:

| Workspace | Responsibility |
| --- | --- |
| `packages/core` (`@marucs-anime/core`) | Manual observations, playback events and sessions, completed-episode progress, input and storage ports. No files, text, source locations, VS Code, Node APIs or network clients. |
| `packages/anl-adapter` (`@marucs-anime/anl-adapter`) | `.anl` grammar, parsing, diagnostics, tags and source positions; maps valid manual entries into core observations. Runs without VS Code. |
| `apps/vscode-extension` | Editor activation, commands, providers, document lifecycle, clock and catalog. Uses the ANL adapter and the core's episode rule. |

The current `.anl` file remains authoritative: editing and saving use the VS Code adapter, with no migration or extra history file. `createAnlHistoryReader(readText)` implements the core's read port; the caller supplies the file or buffer read. The extension also exposes normalized history per parsed document. Invalid recovered entries remain in the document and diagnostics and are excluded from this normalized history view.

The core's `createWatchHistory(storage)` input port accepts `recordManual` and `recordPlayback`. Its `HistoryStorage` port accepts asynchronous `read` and ordered `append`, so a storage implementation can use files, a database or an API. No storage implementation is selected inside the core. Existing `.anl` syntax cannot preserve automatic playback positions; it is a manual source, and is not silently used as a playback event store.

For example, a future Crunchyroll adapter can send observations without any editor or document:

```ts
import { createWatchHistory, type HistoryStorage } from '@marucs-anime/core'

const connectObserver = (storage: HistoryStorage) => {
  const history = createWatchHistory(storage)
  return history.recordPlayback({
    type: 'play', // also pause, position, end
    sessionId: 'crunchyroll-watch-1',
    showTitle: 'Frieren',
    episode: 1,
    occurredAt: '2026-10-12T12:00:00-03:00',
    positionSeconds: 120.5,
  })
}
```

Manual times can remain local civil dates/times when their timezone is unknown. Playback timestamps carry an explicit offset and positions retain subsecond precision. Pauses do not count as playing time; rewinds update the current position while retaining the furthest observed position. Observed playing time is wall time between events while playing, not proof that skipped or buffered media was watched. See the [history contract](docs/watch-history-core.md) for ordering, failures and persistence semantics.

Future UI, MCP, CLI and browser inputs call the same core port; they are not implemented here. This separation follows the existing fleet precedent in `lib/fleet/decisoes_core.py` and `docs/decisoes-core.md`: one domain authority with interchangeable screen clients. See [target architecture](docs/target-architecture.md), the [Effect decision](docs/adr/0001-effect-adoption.md), and the [release checklist](docs/release-checklist.md).

## Scope and limitations

This extraction does not implement future input adapters, a database/API backend, accounts, synchronization or automatic Marketplace publication. The extension's commands, syntax, diagnostics, navigation and completion retain their existing behavior. Code lenses were not retained in the earlier extension rewrite.
