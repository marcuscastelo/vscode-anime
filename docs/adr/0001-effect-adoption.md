# ADR 0001: Do not adopt Effect in the extension rewrite

- Status: accepted
- Date: 2026-07-12

## Context

The rewrite requires typed failures, cancellation, timeout, rate limiting, and testable dependencies at the anime catalog boundary. Effect 3.21.4 was compared with a native Promise/AbortSignal implementation. Effect 4 beta was intentionally excluded because the extension should not adopt a beta runtime as an architectural foundation.

The parser, domain model, diagnostics, and document queries were not candidates for Effect because they are synchronous deterministic functions.

## Experiment

Both candidates implemented the same transport contract and were tested with fake transports for:

- Successful catalog decoding.
- Malformed response handling.
- Timeout and cancellation.

All six corresponding behaviors passed. Both candidates used typed expected failures; Effect represented the failure channel in `Effect<A, E>`, while the native implementation returned a discriminated result.

Minified Node ESM bundles produced by esbuild 0.28.1:

| Candidate | Raw | Gzip |
| --- | ---: | ---: |
| Native Promise/AbortSignal | 833 bytes | 458 bytes |
| Effect 3.21.4 | 196,520 bytes | 64,821 bytes |

The prototype was deleted after measurement. It is intentionally not production code.

## Decision

Do not add Effect to the VS Code extension or `packages/core` for this rewrite.

- Keep the core as plain functions, readonly types, and discriminated unions.
- Implement the catalog adapter with Promise, AbortSignal, explicit result types, and small focused utilities.
- Keep timeout, retry, cache, and rate-limit policies visible at the adapter/application boundary.
- Do not implement a custom dependency injection framework to imitate Effect layers.

## Rationale

Effect materially improves typed asynchronous composition, but this extension currently has one small network boundary and no complex resource graph. The approximately 64 KB compressed runtime delta and additional programming model are not justified by two improvements alone. Native cancellation is already required to integrate with VS Code cancellation tokens.

## Consequences

- The extension remains smaller and understandable to contributors who know standard TypeScript.
- Expected failures still must remain typed; rejecting Effect does not authorize untyped throws or broad `catch` blocks.
- Retry, timeout, and cleanup require explicit tests because they are not supplied by a common runtime.
- Effect may be reconsidered for the future SaaS if it develops multiple concurrent services, streaming workflows, resource lifecycles, or observability requirements. That requires a new ADR and new measurements.
