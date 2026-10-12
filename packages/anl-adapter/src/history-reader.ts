import type { HistoryReader, WatchRecord } from '@marucs-anime/core'
import type { ParsedAnlDocument } from './domain/anl-document.js'
import { parseAnlDocument } from './parsing/parse-anl-document.js'

/** Invalid recovered entries stay in the parsed document and diagnostics, outside the history view. */
export const toWatchRecords = (document: ParsedAnlDocument): readonly WatchRecord[] =>
  document.shows
    .flatMap((show) => show.entries.map((entry) => ({ entry, title: show.title })))
    .sort((left, right) => left.entry.line - right.entry.line)
    .flatMap(({ entry, title }): WatchRecord[] => {
      const { date, startTime, endTime, episode, partial, people } = entry.value
      const parts = date.split('/')
      const isoDate = `${parts[2] ?? ''}-${parts[1] ?? ''}-${parts[0] ?? ''}`
      const day = new Date(`${isoDate}T00:00:00Z`)
      if (
        !Number.isFinite(day.getTime()) ||
        day.toISOString().slice(0, 10) !== isoDate ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)
      )
        return []
      if (endTime < startTime) day.setUTCDate(day.getUTCDate() + 1)
      return [
        {
          kind: 'manual',
          watch: {
            showTitle: title,
            episode,
            completed: !partial,
            people: [...people],
            startedAt: { kind: 'local', date: isoDate, time: startTime },
            endedAt: { kind: 'local', date: day.toISOString().slice(0, 10), time: endTime },
          },
        },
      ]
    })

/** The caller owns files/editor buffers/API transport. Legacy ANL is a read-only manual source. */
export const createAnlHistoryReader = (readText: () => Promise<string>): HistoryReader => ({
  read: async () => toWatchRecords(parseAnlDocument(await readText()).document),
})
