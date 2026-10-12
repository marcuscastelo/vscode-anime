import { describe, expect, it } from 'vitest'
import {
  createWatchHistory,
  type HistoryStorage,
  nextEpisode,
  type PlaybackEvent,
  projectPlayback,
  type WatchRecord,
} from '../src/index.js'

const event = (
  type: PlaybackEvent['type'],
  seconds: number,
  positionSeconds: number,
  sessionId = 'crunchyroll-session-1',
): PlaybackEvent => ({
  type,
  sessionId,
  showTitle: 'Frieren',
  episode: 1,
  occurredAt: new Date(Date.UTC(2026, 9, 12, 15, 0, seconds)).toISOString(),
  positionSeconds,
})

const memoryStorage = (initial: readonly WatchRecord[] = []): HistoryStorage => {
  const records = [...initial]
  return {
    read: () => Promise.resolve([...records]),
    append: (record) => {
      records.push(record)
      return Promise.resolve()
    },
  }
}

describe('watching history', () => {
  it('keeps the completed-episode rule independent of documents', () => {
    expect(nextEpisode([])).toBe(1)
    expect(
      nextEpisode([
        { episode: 8, completed: true },
        { episode: 9, completed: false },
        { episode: 2, completed: true },
      ]),
    ).toBe(9)
  })

  it('records play, pause, position, rewind, resume and end without counting paused time', async () => {
    const history = createWatchHistory(memoryStorage())
    for (const observation of [
      event('play', 0, 120),
      event('position', 10, 130),
      event('pause', 20, 140),
      event('position', 30, 100),
      event('play', 40, 100),
      event('end', 50, 110),
    ])
      expect(await history.recordPlayback(observation)).toEqual({ tag: 'recorded' })
    expect(await history.sessions()).toEqual({
      tag: 'ok',
      value: [
        {
          sessionId: 'crunchyroll-session-1',
          showTitle: 'Frieren',
          episode: 1,
          firstObservedAt: event('play', 0, 0).occurredAt,
          lastObservedAt: event('end', 50, 0).occurredAt,
          status: 'ended',
          positionSeconds: 110,
          furthestPositionSeconds: 140,
          observedPlayingSeconds: 30,
        },
      ],
    })
  })

  it('does not guess playback before a first position or across a pause', () => {
    expect(
      projectPlayback([
        { kind: 'playback', event: event('position', 0, 400) },
        { kind: 'playback', event: event('pause', 10, 410) },
      ]),
    ).toMatchObject({ tag: 'ok', value: [{ status: 'paused', observedPlayingSeconds: 0 }] })
  })

  it('keeps interleaved shows and rewatch sessions independent', () => {
    const second = { ...event('play', 1, 0, 'other'), showTitle: 'Other', episode: 2 }
    expect(
      projectPlayback([
        { kind: 'playback', event: event('play', 0, 0) },
        { kind: 'playback', event: second },
        { kind: 'playback', event: event('end', 10, 10) },
        { kind: 'playback', event: event('play', 12, 0, 'rewatch') },
      ]),
    ).toMatchObject({
      tag: 'ok',
      value: [
        { status: 'ended', observedPlayingSeconds: 10 },
        { status: 'playing', showTitle: 'Other', observedPlayingSeconds: 0 },
        { status: 'playing', sessionId: 'rewatch', observedPlayingSeconds: 0 },
      ],
    })
  })

  it.each([
    { ...event('play', 0, 0), positionSeconds: -1 },
    { ...event('play', 0, 0), positionSeconds: Number.NaN },
    { ...event('play', 0, 0), episode: -1 },
    { ...event('play', 0, 0), episode: Number.POSITIVE_INFINITY },
    { ...event('play', 0, 0), sessionId: '' },
    { ...event('play', 0, 0), showTitle: ' ' },
    { ...event('play', 0, 0), occurredAt: '2026-10-12T15:00:00' },
    { ...event('play', 0, 0), occurredAt: 'invalid' },
  ])('rejects invalid observations as data before writing: %j', async (invalid) => {
    const history = createWatchHistory(memoryStorage())
    expect(await history.recordPlayback(invalid)).toMatchObject({ tag: 'invalid' })
    expect(await history.read()).toEqual({ tag: 'ok', value: [] })
  })

  it('preserves ordering and session identity after recreation from storage', async () => {
    const storage = memoryStorage()
    const first = createWatchHistory(storage)
    await first.recordPlayback(event('play', 20, 20))
    const restarted = createWatchHistory(storage)
    expect(await restarted.recordPlayback(event('pause', 10, 10))).toMatchObject({ tag: 'invalid' })
    expect(await restarted.recordPlayback({ ...event('pause', 30, 30), episode: 2 })).toMatchObject(
      { tag: 'invalid' },
    )
    expect(await restarted.recordPlayback(event('end', 30, 30))).toEqual({ tag: 'recorded' })
    expect(await restarted.recordPlayback(event('play', 40, 0))).toMatchObject({ tag: 'invalid' })
    expect(await restarted.sessions()).toMatchObject({
      tag: 'ok',
      value: [{ observedPlayingSeconds: 10 }],
    })
  })

  it('serializes concurrent observations without rereading all history for every position', async () => {
    let reads = 0
    const store = memoryStorage()
    const history = createWatchHistory({
      ...store,
      read: () => {
        reads++
        return store.read()
      },
    })
    const results = await Promise.all(
      Array.from({ length: 500 }, (_, i) =>
        history.recordPlayback(event(i === 0 ? 'play' : 'position', i, i)),
      ),
    )
    expect(results.every((result) => result.tag === 'recorded')).toBe(true)
    expect(reads).toBe(1)
    expect(await history.sessions()).toMatchObject({
      tag: 'ok',
      value: [{ observedPlayingSeconds: 499 }],
    })
  })

  it('keeps manual civil times without inventing timezone or position', async () => {
    const history = createWatchHistory(memoryStorage())
    const record: WatchRecord = {
      kind: 'manual',
      watch: {
        showTitle: 'Frieren',
        episode: 1,
        completed: false,
        people: ['friend'],
        startedAt: { kind: 'local', date: '2026-10-12', time: '23:55' },
        endedAt: { kind: 'local', date: '2026-10-13', time: '00:10' },
      },
    }
    if (record.kind !== 'manual') throw new Error('Invalid test fixture')
    expect(await history.recordManual(record.watch)).toEqual({ tag: 'recorded' })
    expect(await history.read()).toEqual({ tag: 'ok', value: [record] })
    expect(await history.sessions()).toEqual({ tag: 'ok', value: [] })
  })

  it('does not advance state on storage failure and allows retry', async () => {
    let fails = true
    const store = memoryStorage()
    const history = createWatchHistory({
      ...store,
      append: (record) => {
        if (fails) return Promise.reject(new Error('Offline'))
        return store.append(record)
      },
    })
    expect(await history.recordPlayback(event('play', 0, 0))).toMatchObject({
      tag: 'storage-error',
    })
    fails = false
    expect(await history.recordPlayback(event('play', 0, 0))).toEqual({ tag: 'recorded' })
    expect(await history.sessions()).toMatchObject({ tag: 'ok', value: [{ status: 'playing' }] })
  })

  it('returns read failures as values and retries a failed initial load', async () => {
    let fails = true
    const history = createWatchHistory({
      read: () => (fails ? Promise.reject(new Error('Offline')) : Promise.resolve([])),
      append: () => Promise.resolve(),
    })
    expect(await history.read()).toMatchObject({ tag: 'storage-error' })
    fails = false
    expect(await history.read()).toEqual({ tag: 'ok', value: [] })
  })
})
