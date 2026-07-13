import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { parseAnlDocument } from '../../src/index.js'

const fixture = (name: string): string =>
  readFileSync(new URL(`../fixtures/${name}`, import.meta.url), 'utf8')

describe('parseAnlDocument', () => {
  it('parses dates, shows, entries, and people from a complete document', () => {
    const result = parseAnlDocument(fixture('basic.anl'))
    expect(result.diagnostics).toEqual([])
    expect(result.document.people).toEqual(['marcuscastelo'])
    expect(result.document.shows).toHaveLength(1)
    expect(result.document.shows[0]).toMatchObject({
      entries: [
        { value: { date: '09/03/2022', episode: 1, partial: false } },
        {
          value: {
            date: '09/03/2022',
            episode: 2,
            partial: false,
            people: ['marcuscastelo'],
          },
        },
      ],
      title: 'Shingeki no Kyojin',
    })
  })

  it('infers a partial episode without advancing completed history', () => {
    const result = parseAnlDocument(fixture('partial-episodes.anl'))
    expect(result.document.shows[0]?.entries.map((entry) => entry.value)).toMatchObject([
      { episode: 98, partial: false },
      { episode: 99, partial: true },
      { episode: 99, partial: false },
    ])
  })

  it('accepts Unicode titles in the rewritten compatibility contract', () => {
    const result = parseAnlDocument(fixture('unicode-titles.anl'))
    expect(result.document.shows[0]?.title).toBe('進撃の巨人')
    expect(result.document.people).toEqual(['マルクス'])
  })

  it('recovers after malformed lines and retains later entries', () => {
    const result = parseAnlDocument(fixture('malformed-lines.anl'))
    expect(result.diagnostics.map((item) => item.code)).toEqual([
      'unknown-line',
      'invalid-time',
      'invalid-time',
      'unknown-line',
      'unknown-tag',
    ])
    expect(result.document.shows[0]?.entries.at(-1)?.value.episode).toBe(2)
  })

  it('reports missing date and show context without throwing', () => {
    const result = parseAnlDocument('20:00 - 20:24 01\n16/03/2022\n20:25 - 20:49 02')
    expect(result.diagnostics.map((item) => item.code)).toEqual([
      'watch-entry-without-date',
      'watch-entry-without-show',
    ])
  })

  it('reports calendar and chronological date errors', () => {
    const result = parseAnlDocument('31/02/2022\n20/03/2022\n19/03/2022\n19/03/2022')
    expect(result.diagnostics.map((item) => item.code)).toEqual([
      'invalid-date',
      'date-out-of-order',
      'redundant-date',
    ])
  })

  it('parses a 10,000-entry document inside the interactive budget', () => {
    const entries = Array.from(
      { length: 10_000 },
      (_, index) => `20:00 - 20:24 ${String(index + 1).padStart(2, '0')}`,
    )
    const source = ['12/07/2026', 'Long-running show:', ...entries].join('\n')
    const startedAt = performance.now()
    const result = parseAnlDocument(source)
    const elapsedMs = performance.now() - startedAt

    expect(result.document.shows[0]?.entries).toHaveLength(10_000)
    expect(result.diagnostics).toEqual([])
    expect(elapsedMs).toBeLessThan(1_000)
  })
})
