# Release checklist

Marketplace publication is deliberately manual. Run this checklist from a clean working tree before creating a release.

## Automated gates

- [ ] Use Node 22 or 24 and pnpm 10.12.1.
- [ ] Run `pnpm install --frozen-lockfile`.
- [ ] Run `pnpm check`.
- [ ] Run `pnpm test:coverage` and review both workspace reports.
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
