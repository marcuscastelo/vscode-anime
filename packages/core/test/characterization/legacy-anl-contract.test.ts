import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  classifyLegacyDocument,
  type LegacyLine,
  nextCompletedEpisode,
} from './legacy-line-oracle.js'

const fixture = (name: string): string =>
  readFileSync(new URL(`../fixtures/${name}`, import.meta.url), 'utf8')

const significant = (lines: readonly LegacyLine[]): readonly LegacyLine[] =>
  lines.filter((line) => line.kind !== 'ignored')

describe('legacy .anl compatibility', () => {
  it('captures the established date, title, entry, and company shape', () => {
    expect(significant(classifyLegacyDocument(fixture('basic.anl')))).toEqual([
      { kind: 'date', value: '09/03/2022' },
      { kind: 'show', title: 'Shingeki no Kyojin' },
      {
        endTime: '23:30',
        episode: 1,
        kind: 'watch-entry',
        partial: false,
        people: [],
        startTime: '23:05',
      },
      {
        endTime: '23:55',
        episode: 2,
        kind: 'watch-entry',
        partial: false,
        people: ['marcuscastelo'],
        startTime: '23:30',
      },
    ])
  })

  it('ignores comments while preserving the legacy leading-date whitespace limitation', () => {
    expect(significant(classifyLegacyDocument(fixture('comments-and-whitespace.anl')))).toEqual([
      { kind: 'invalid', reason: 'unknown-line' },
      { kind: 'show', title: 'Cowboy Bebop' },
      {
        endTime: '20:24',
        episode: 1,
        kind: 'watch-entry',
        partial: false,
        people: [],
        startTime: '20:00',
      },
    ])
  })

  it('does not advance the next episode for a partial entry', () => {
    const lines = classifyLegacyDocument(fixture('partial-episodes.anl'))
    expect(nextCompletedEpisode(lines)).toBe(100)
    expect(lines).toContainEqual({
      endTime: '18:40',
      episode: null,
      kind: 'watch-entry',
      partial: true,
      people: [],
      startTime: '18:25',
    })
  })

  it('captures built-in tags and tag parameters', () => {
    const tags = classifyLegacyDocument(fixture('tags.anl')).filter((line) => line.kind === 'tag')
    expect(tags).toEqual([
      { kind: 'tag', name: 'NOT-IN-MAL', parameters: {} },
      { kind: 'tag', name: 'REWATCH', parameters: {} },
      { kind: 'tag', name: 'UNSAFE-ORDER', parameters: {} },
      { kind: 'tag', name: 'SCRIPT-SKIP', parameters: { count: '100' } },
    ])
  })

  it('records the legacy Unicode-title limitation instead of silently changing it', () => {
    expect(significant(classifyLegacyDocument(fixture('unicode-titles.anl')))).toEqual([
      { kind: 'date', value: '13/03/2022' },
      { kind: 'invalid', reason: 'unknown-line' },
      { kind: 'tag', name: '勉強', parameters: {} },
      {
        endTime: '07:35',
        episode: 1,
        kind: 'watch-entry',
        partial: false,
        people: ['マルクス'],
        startTime: '07:10',
      },
    ])
  })

  it('accepts a watch entry crossing midnight lexically', () => {
    expect(significant(classifyLegacyDocument(fixture('midnight-crossing.anl')))).toContainEqual({
      endTime: '00:15',
      episode: 1,
      kind: 'watch-entry',
      partial: false,
      people: [],
      startTime: '23:50',
    })
  })

  it('captures recoverable malformed lines without losing later entries', () => {
    const lines = significant(classifyLegacyDocument(fixture('malformed-lines.anl')))
    expect(lines.filter((line) => line.kind === 'invalid')).toEqual([
      { kind: 'invalid', reason: 'unknown-line' },
      { kind: 'invalid', reason: 'unknown-line' },
      { kind: 'invalid', reason: 'unknown-tag' },
    ])
    expect(lines.at(-1)).toEqual({
      endTime: '19:49',
      episode: 2,
      kind: 'watch-entry',
      partial: false,
      people: [],
      startTime: '19:25',
    })
  })
})
