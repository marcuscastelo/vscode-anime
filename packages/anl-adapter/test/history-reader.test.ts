import { describe, expect, it } from 'vitest'
import { createAnlHistoryReader, parseAnlDocument, toWatchRecords } from '../src/index.js'

describe('ANL history adapter', () => {
  it('reads manual observations without leaking source locations or tags into core', async () => {
    const source = '12/10/2026\nFrieren:\n23:55 - 00:10 01 {friend}\n00:11 - 00:20 --'
    const records = await createAnlHistoryReader(() => Promise.resolve(source)).read()
    expect(records).toEqual([
      {
        kind: 'manual',
        watch: {
          showTitle: 'Frieren',
          episode: 1,
          completed: true,
          people: ['friend'],
          startedAt: { kind: 'local', date: '2026-10-12', time: '23:55' },
          endedAt: { kind: 'local', date: '2026-10-13', time: '00:10' },
        },
      },
      {
        kind: 'manual',
        watch: {
          showTitle: 'Frieren',
          episode: 2,
          completed: false,
          people: [],
          startedAt: { kind: 'local', date: '2026-10-12', time: '00:11' },
          endedAt: { kind: 'local', date: '2026-10-12', time: '00:20' },
        },
      },
    ])
  })

  it('preserves source order across repeated shows and recovers only valid observations', () => {
    const parsed = parseAnlDocument(
      '12/10/2026\nOne:\n20:00 - 20:20 01\nTwo:\n20:30 - 20:50 01\nOne:\n25:00 - 25:20 02\n21:00 - 21:20 03',
    )
    expect(
      toWatchRecords(parsed.document).map((record) =>
        record.kind === 'manual' ? record.watch.showTitle : '',
      ),
    ).toEqual(['One', 'Two', 'One'])
    expect(parsed.diagnostics.some((item) => item.code === 'invalid-time')).toBe(true)
  })

  it('does not normalize an invalid calendar into a different day', () => {
    expect(
      toWatchRecords(parseAnlDocument('31/02/2026\nShow:\n20:00 - 20:20 01').document),
    ).toEqual([])
  })

  it('rolls civil dates over month and year boundaries without inferring a timezone', () => {
    const records = toWatchRecords(parseAnlDocument('31/12/2026\nShow:\n23:55 - 00:10 01').document)
    expect(records).toMatchObject([{ watch: { endedAt: { date: '2027-01-01' } } }])
  })
})
