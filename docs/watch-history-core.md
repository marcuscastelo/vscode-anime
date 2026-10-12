# Watching history contract

Marcus clarified the product boundary on 12 October 2026: the core records watching observations, without knowing files or text editors. Inputs and persistence are interchangeable ports. Browser playback detection, rather than manual episode completion alone, guides the model.

This supersedes the document-oriented meaning of `core` in the completed extension-rewrite PRD. The published baseline for this extraction is `1f913d6` on `develop`; the older local checkout predates that rewrite. No earlier rewrite capability is removed by the extraction.

## Domain

`ManualWatch` records show, episode, completion, company, start and end observations. `WatchTime` distinguishes an instant with offset from a local civil date/time with unknown timezone. The core does not manufacture an offset or playback position from a manual interval.

`PlaybackEvent` records `play`, `pause`, `position` or `end`, a session id, show, episode, timestamp with explicit offset and position in seconds. A session belongs to one show and episode. Observations must arrive chronologically within that session; interleaved sessions are independent. A rewatch or loop after `end` starts a new session id. Input adapters own media identification and event delivery order.

`observePlayback` is a pure transition. `projectPlayback` replays persisted observations. A session exposes first/last observed timestamps, status, current position, furthest observed position and observed playing seconds. The first observation may be a position or pause; earlier play is unknown. A seek backwards reduces current position, never furthest position. No time after the last observation is counted. Buffering cannot be distinguished from playing without a corresponding observer event; elapsed playing time is not media coverage.

`nextEpisode` consumes plain episode/completion observations. It preserves the extension rule: highest completed episode plus one; partial observations do not advance it and rewatch does not reduce it. `end` describes playback reaching its end, not proof of complete media coverage. Consumers explicitly decide which observations count as completed episodes.

## Ports

`createWatchHistory(HistoryStorage)` supplies the input port: `recordManual`, `recordPlayback`, `read` and `sessions`. Expected observation and storage failures return discriminated results (`invalid`, `storage-error`); successful writes return `recorded`.

`HistoryReader.read()` returns ordered plain records. `HistoryStorage` adds `append(record)`. The implementation must preserve append order, own serialization, and resolve only after persistence succeeds. A failed append must leave no committed record; implementations with ambiguous commit outcomes must reconcile before retry. This is a single-writer contract. Shared multiwriter locking, deduplication and transport authentication belong to a concrete adapter, not an implied guarantee of this port.

The service queues reads and writes, loads history once, and maintains session progress incrementally. Recreating it reloads and replays the storage source. Frequent browser position events do not reread all storage or copy the entire log on each append. Returned data and input arguments cannot mutate owned state. All successful appends are retained; pruning or compaction is a later storage policy, not part of this extraction.

The current `.anl` adapter implements `HistoryReader` through `createAnlHistoryReader(readText)`, normalizes civil dates, handles midnight crossing, and retains source ordering. Malformed recovered entries remain visible to the editor parser and diagnostics but do not become valid domain observations. The editor still writes and saves its existing `.anl` text. There is no automatic migration, second file or playback-specific `.anl` syntax.

## Precedent and consumers

The inspected fleet precedent is `lib/fleet/decisoes_core.py` with `docs/decisoes-core.md`: multiple screens call common domain operations. Its particular Python/server implementation is not copied; this repository retains its functional TypeScript model and explicit injection.

`anime-backup` (`marcuscastelo/anime-backup`) is a Go CLI that copies configured source files, commits and pushes them (`internal/backup/backup.go`, `internal/app/app.go`, `go.mod`). It can keep backing up `.anl` unchanged. It cannot directly import this TypeScript package into Go; semantic history consumption would need an explicit process or API bridge. No change to that project is required or made. Neither a bridge nor future UI/MCP/CLI/browser adapters are implemented here.

## Verification

Core tests exercise playback transitions, paused time, seeks, subsecond positions, independent sessions, invalid events, ordered concurrent delivery, defensive copies, storage failure recovery and recreation. A test-only file implementation verifies rereading persisted records after both storage and service are recreated; it defines no production file format.

ANL and extension characterization tests remain in their respective workspaces. `node scripts/compare-anl-behavior.mjs <baseline-checkout>` runs the real base and candidate in separate processes over 512 fixed-seed scenarios, comparing parsed data, diagnostics, symbols, definitions, hover, completion, next-episode and time-insertion plans. It does not prove live network behavior or physical macOS key presses; existing catalog contracts and manifest tests cover those unchanged adapters.
