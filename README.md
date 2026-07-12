# Marucs' Anime

Marucs' Anime is a VS Code extension for recording watched anime episodes in plain-text `.anl` files.

The repository is preparing a complete parallel rewrite. The new implementation will be a monorepo with a framework-independent core and a thin VS Code adapter. Existing `.anl` files and the principal editor workflows will remain compatible.

## Preserved experience

- Parse and highlight `.anl` documents.
- Show useful diagnostics for invalid entries.
- Complete previously used titles, people, and tags.
- Search anime information through an external catalog adapter.
- Insert the current date and current time.
- Insert the next episode number from document history.
- Provide default shortcuts on Windows/Linux and `Cmd+Shift+D/T/N` on macOS.

## Planning documents

- [ANL compatibility](docs/anl-compatibility.md)
- [Product behavior](docs/product-behavior.md)
- [Target architecture](docs/target-architecture.md)
- [Rewrite PRD](tasks/prd-extension-rewrite.md)
- [Commit plan](tasks/commit-plan-extension-rewrite.md)
- [Goal and stopping contract](tasks/goal-extension-rewrite.md)

The legacy implementation remains the behavioral reference until the replacement reaches parity. Implementation commands and final workspace scripts will be documented when the monorepo scaffold is introduced.
