import { appendFile, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createWatchHistory, type HistoryStorage, type WatchRecord } from '../src/index.js'

describe('history storage port', () => {
  it('replays real persisted observations after recreating both the storage adapter and core', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'anime-history-contract-'))
    const path = join(dir, 'observations.jsonl')
    // Test-only file implementation. The core receives just the storage port.
    const fileStorage = (): HistoryStorage => ({
      read: async () =>
        (await readFile(path, 'utf8'))
          .trim()
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line) as WatchRecord),
      append: (record) => appendFile(path, `${JSON.stringify(record)}\n`),
    })
    try {
      await appendFile(path, '')
      const initial = createWatchHistory(fileStorage())
      const play = {
        type: 'play' as const,
        sessionId: 'browser',
        showTitle: 'Frieren',
        episode: 1,
        occurredAt: '2026-10-12T12:00:00-03:00',
        positionSeconds: 12.5,
      }
      expect(await initial.recordPlayback(play)).toEqual({ tag: 'recorded' })
      const recreated = createWatchHistory(fileStorage())
      expect(
        await recreated.recordPlayback({
          ...play,
          type: 'pause',
          occurredAt: '2026-10-12T15:00:00.750Z',
          positionSeconds: 13.25,
        }),
      ).toEqual({ tag: 'recorded' })
      expect(await createWatchHistory(fileStorage()).sessions()).toMatchObject({
        tag: 'ok',
        value: [{ status: 'paused', positionSeconds: 13.25, observedPlayingSeconds: 0.75 }],
      })
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  it('keeps source arguments and returned values separate from owned state', async () => {
    const records: WatchRecord[] = []
    const history = createWatchHistory({
      read: () => Promise.resolve(records),
      append: (record) => {
        records.push(record)
        return Promise.resolve()
      },
    })
    const input = {
      type: 'play' as const,
      sessionId: 'one',
      showTitle: 'Frieren',
      episode: 1,
      occurredAt: '2026-10-12T15:00:00Z',
      positionSeconds: 0,
    }
    const recording = history.recordPlayback(input)
    input.positionSeconds = 999
    await recording
    const first = await history.read()
    if (first.tag !== 'ok') throw new Error('Expected history')
    const record = first.value[0]
    if (record?.kind !== 'playback') throw new Error('Expected playback')
    Object.assign(record.event, { positionSeconds: 888 })
    expect(await history.read()).toMatchObject({
      tag: 'ok',
      value: [{ event: { positionSeconds: 0 } }],
    })
  })

  it('queues an initial read and a write so a slow load cannot overwrite recorded state', async () => {
    let reads = 0
    let release: (() => void) | undefined
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const history = createWatchHistory({
      read: async () => {
        reads++
        await gate
        return []
      },
      append: () => Promise.resolve(),
    })
    const reading = history.read()
    const recording = history.recordPlayback({
      type: 'play',
      sessionId: 'one',
      showTitle: 'Frieren',
      episode: 1,
      occurredAt: '2026-10-12T15:00:00Z',
      positionSeconds: 0,
    })
    release?.()
    expect(await reading).toEqual({ tag: 'ok', value: [] })
    expect(await recording).toEqual({ tag: 'recorded' })
    expect(await history.sessions()).toMatchObject({ tag: 'ok', value: [{ sessionId: 'one' }] })
    expect(reads).toBe(1)
  })
})
