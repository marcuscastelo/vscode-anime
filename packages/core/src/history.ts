import type {
  InvalidObservation,
  ManualWatch,
  PlaybackEvent,
  PlaybackSession,
  WatchRecord,
} from './model.js'
import { observePlayback, projectPlayback } from './playback.js'

export type StorageFailure = Readonly<{ tag: 'storage-error'; reason: string }>
export type HistoryResult<T> =
  | Readonly<{ tag: 'ok'; value: T }>
  | StorageFailure
  | InvalidObservation
export type RecordResult = Readonly<{ tag: 'recorded' }> | StorageFailure | InvalidObservation

export type HistoryReader = Readonly<{ read: () => Promise<readonly WatchRecord[]> }>
/** Single writer, append order preserved; resolve append only after persistence succeeds. */
export type HistoryStorage = HistoryReader &
  Readonly<{
    append: (record: WatchRecord) => Promise<void>
  }>

export type WatchHistory = Readonly<{
  read: () => Promise<HistoryResult<readonly WatchRecord[]>>
  sessions: () => Promise<HistoryResult<readonly PlaybackSession[]>>
  recordManual: (watch: ManualWatch) => Promise<RecordResult>
  recordPlayback: (event: PlaybackEvent) => Promise<RecordResult>
}>

const copyRecord = (record: WatchRecord): WatchRecord =>
  record.kind === 'manual'
    ? {
        kind: 'manual',
        watch: {
          ...record.watch,
          startedAt: { ...record.watch.startedAt },
          endedAt: { ...record.watch.endedAt },
          people: [...record.watch.people],
        },
      }
    : { kind: 'playback', event: { ...record.event } }

const storageFailure = (error: unknown): StorageFailure => ({
  tag: 'storage-error',
  reason: error instanceof Error ? error.message : 'History storage unavailable',
})

/** Input port: UI/CLI/MCP/browser observers call these operations, supplying plain observations. */
export const createWatchHistory = (storage: HistoryStorage): WatchHistory => {
  let records: WatchRecord[] | undefined
  let sessions = new Map<string, PlaybackSession>()
  let pending: Promise<void> = Promise.resolve()

  const load = async (): Promise<HistoryResult<WatchRecord[]>> => {
    if (records !== undefined) return { tag: 'ok', value: records }
    try {
      const stored = (await storage.read()).map(copyRecord)
      const projected = projectPlayback(stored)
      if (projected.tag === 'invalid') return projected
      sessions = new Map(projected.value.map((session) => [session.sessionId, session]))
      records = stored
      return { tag: 'ok', value: stored }
    } catch (error) {
      return storageFailure(error)
    }
  }

  const append = (input: WatchRecord): Promise<RecordResult> => {
    const record = copyRecord(input)
    const result = pending.then(async (): Promise<RecordResult> => {
      const loaded = await load()
      if (loaded.tag !== 'ok') return loaded
      const observed =
        record.kind === 'playback'
          ? observePlayback(sessions.get(record.event.sessionId), record.event)
          : undefined
      if (observed?.tag === 'invalid') return observed
      try {
        await storage.append(copyRecord(record))
      } catch (error) {
        return storageFailure(error)
      }
      loaded.value.push(record)
      if (observed?.tag === 'ok') sessions.set(observed.value.sessionId, observed.value)
      return { tag: 'recorded' }
    })
    pending = result.then(() => undefined)
    return result
  }

  const enqueue = <T>(operation: () => Promise<T>): Promise<T> => {
    const result = pending.then(operation)
    pending = result.then(() => undefined)
    return result
  }

  return {
    read: () =>
      enqueue(async () => {
        const result = await load()
        return result.tag === 'ok'
          ? { tag: 'ok' as const, value: result.value.map(copyRecord) }
          : result
      }),
    sessions: () =>
      enqueue(async () => {
        const result = await load()
        return result.tag === 'ok'
          ? { tag: 'ok' as const, value: [...sessions.values()].map((session) => ({ ...session })) }
          : result
      }),
    recordManual: (watch) => append({ kind: 'manual', watch }),
    recordPlayback: (event) => append({ kind: 'playback', event }),
  }
}
