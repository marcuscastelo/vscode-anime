# `.anl` compatibility contract

## Purpose

This document defines the input that the rewritten core must continue to accept. It describes compatibility, not an idealized future grammar. A future format revision must be designed separately and must not silently reinterpret existing files.

## Document model

An `.anl` document is an ordered stream of lines. Meaning depends on preceding date, show, and tag lines. Blank lines and comments do not reset context.

### Comments

`//` starts a comment. A full-line comment is ignored. Existing files also use trailing comments; the parser must ignore the comment suffix before classifying the line.

```anl
// a comment
23:05 - 23:30 01 // trailing comment
```

### Date

A date is written as `DD/MM/YYYY` on its own line.

```anl
09/03/2022
```

Dates establish the current day and reset the current show. Calendar validity and chronological ordering are semantic validations rather than lexical classification.

### Show title

A show title ends with `:`. Leading and trailing whitespace are tolerated. Titles must continue to support letters, digits, spaces, punctuation, and non-ASCII text already accepted by existing files.

```anl
Shingeki no Kyojin:
進撃の巨人:
```

### Watch entry

The established shape is:

```text
HH:MM - HH:MM EPISODE {person one, person two}
```

Examples:

```anl
23:05 - 23:30 01
23:30 - 23:55 02 {marcuscastelo}
23:55 - 00:10 --
```

- Start time, end time, and episode are required for a complete entry.
- Numeric episodes retain the existing minimum two-character representation, including values such as `01` and `12`.
- `--` represents a partial or non-final episode entry and must not advance the last completed episode.
- The company block is optional and contains comma-separated names.
- Crossing midnight must be representable even if the legacy validation is incomplete.

### Tags

Tags use square brackets, optionally followed by comma-separated `name=value` parameters.

```anl
[REWATCH]
[SCRIPT-SKIP(count=100)]
```

The initial rewrite must recognize the legacy built-ins:

- Show: `NOT-ANIME`, `NOT-IN-MAL`, `MANGA`, `WEBTOON`, `COURSE`, `DORAMA`.
- Watch session: `勉強`, `REWATCH`.
- Watch line: `UNSAFE-ORDER`.
- Script: `SCRIPT-SKIP(count=...)`.

## Semantic output

The core parser must produce a serializable document model containing shows, dated watch sessions, entries, people, tags, and source locations. Source locations belong to the parsed-document representation and must not contaminate reusable business entities.

Parsing must return both recovered data and diagnostics whenever safe recovery is possible. One invalid line must not prevent later valid lines from being processed.

## Compatibility verification

- Copy real, anonymized legacy documents into versioned fixtures.
- Record expected parsed values and diagnostics as characterization tests.
- Include whitespace, comments, Unicode titles, tags, partial episodes, repeated shows, malformed lines, and midnight crossings.
- Verify that opening a legacy fixture never changes the file automatically.

## Intentionally unsupported compatibility

Internal cache JSON, registry serialization, log messages, singleton lifecycle, and exact diagnostic wording are not compatibility contracts.
