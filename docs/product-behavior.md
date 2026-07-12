# Product behavior baseline

## Primary workflow

1. The user opens or creates a `.anl` file.
2. The extension recognizes the language and highlights dates, titles, times, episodes, company, tags, and comments.
3. The user inserts today's date.
4. While typing a title, the extension suggests titles already present in the document and can search the configured anime catalog.
5. The user inserts the current start and end times.
6. The user inserts the next completed episode number for the current show.
7. Diagnostics explain malformed or contextually invalid lines without blocking editing.

## Required capabilities

### Document intelligence

- Parse on open and after relevant edits without requiring a save.
- Keep diagnostics scoped to the correct document.
- Provide document symbols, title definitions, hover information, completion items, and useful code lenses where the behavior remains valuable.
- Never derive one document's state from another document's cache.

### Completion and anime search

- Suggest show titles recently used in the current document.
- Suggest known people inside `{}` and known tags inside `[]`.
- Query an anime catalog asynchronously when local title suggestions are insufficient.
- Debounce and cancel stale searches, rate-limit requests, cache bounded results, and fail without breaking local completion.
- Keep catalog DTOs out of the domain model.

### Commands

- Insert date in `DD/MM/YYYY` using an injected clock and explicit local timezone behavior.
- Insert time in `HH:MM`, preserving the two-step start/end workflow.
- Warn before inserting a time under a date other than today.
- Insert the next episode as the last completed episode plus one, padded to at least two digits.
- Ignore partial `--` entries when calculating the next episode.
- Behave predictably with multiple cursors; either support them explicitly or show a clear non-destructive message.

### Default shortcuts

| Action | Windows/Linux | macOS |
| --- | --- | --- |
| Insert date | `Alt+D` | `Cmd+Shift+D` |
| Insert time | `Alt+T` | `Cmd+Shift+T` |
| Insert next episode | `Alt+N` | `Cmd+Shift+N` |

Command identifiers may change. The Command Palette titles must remain clear and user-configurable.

## Quality expectations

- Activation must not erase workspace state.
- Normal editing must not produce uncaught exceptions.
- Network failure must not disable parsing or local completion.
- Large documents should not be reparsed synchronously in full after every keystroke.
- The packaged VSIX must contain the actual entry point declared in its manifest.

## Out of scope for this rewrite

- SaaS frontend, backend, accounts, synchronization, or database persistence.
- A new `.anl` syntax version or automatic migration.
- Compatibility with internal cache formats or command IDs.
- Publishing automatically to the Marketplace before manual release validation exists.
