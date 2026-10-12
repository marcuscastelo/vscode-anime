# Release checklist

Marketplace publication is deliberately manual. Run this checklist from a clean working tree before creating a release.

## Automated gates

- [ ] Use Node 22 or 24 and pnpm 10.12.1.
- [ ] Run `pnpm install --frozen-lockfile`.
- [ ] Run `pnpm check`.
- [ ] Run `pnpm test:coverage` and review all workspace reports.
- [ ] Run `pnpm test:integration` in the real VS Code Extension Host.
- [ ] Run `pnpm audit:production`; no high or critical finding may remain unexplained.
- [ ] Run `pnpm package` and `pnpm package:verify`.
- [ ] Confirm CI is green and download the `marucs-anime-vsix` artifact.

## Manual smoke

- [ ] Install `artifacts/marucs-anime.vsix` into an isolated VS Code profile.
- [ ] Open each compatibility fixture without any content modification.
- [ ] Confirm highlighting, diagnostics, symbols, definition, hover, and local completion.
- [ ] Confirm offline/network failure preserves parsing and local completion.
- [ ] On macOS, verify `Cmd+Shift+D/T/N` without interfering with Option character entry.
- [ ] On Windows or Linux, verify `Alt+D/T/N`.
- [ ] Exercise current date, both time insertions, different-date cancellation, and next episode after a partial entry.
- [ ] Inspect the VSIX: no sources, tests, coverage, maps, downloaded VS Code, or legacy implementation.

## Release

- [ ] Review version and changelog/release notes.
- [ ] Create and test the final VSIX from the release commit.
- [ ] Publish manually with authorized Marketplace credentials.
- [ ] Tag the exact published commit and attach the verified VSIX if repository policy permits.

## Extension Host launch compatibility

Keep `@vscode/test-electron` at 3.1.0 or later. Current macOS VS Code bundles declare
`Code` in `Info.plist`; 3.0.0 hardcodes `Contents/MacOS/Electron` and fails with ENOENT
before loading the extension. The same failure affects the earlier `develop` baseline
when it downloads a current bundle. The unit contract exercises both `Code` and legacy
`Electron` bundles on Intel and ARM paths, and CI runs the real macOS Extension Host.
The runner also clears inherited `ELECTRON_RUN_AS_NODE` and isolates temporary profiles.

Unix test profiles use a short, unique `/tmp/anl-*` directory. macOS TMPDIR can be
long enough to exceed the 103-character IPC socket path limit; the runner contract
sets a long TMPDIR and opens a real Unix socket before checking profile cleanup.
