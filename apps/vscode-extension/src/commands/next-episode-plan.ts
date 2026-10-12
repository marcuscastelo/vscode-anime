import { findShowAtLine, type ParsedAnlDocument } from '@marucs-anime/anl-adapter'
import { nextEpisode } from '@marucs-anime/core'

export type NextEpisodePlan =
  | Readonly<{ reason: 'show-not-found'; tag: 'no-change' }>
  | Readonly<{ text: string; tag: 'insert' }>

export const planNextEpisode = (document: ParsedAnlDocument, line: number): NextEpisodePlan => {
  const show = findShowAtLine(document, line)
  if (show === undefined) return { reason: 'show-not-found', tag: 'no-change' }

  const episode = nextEpisode(
    show.entries.map((entry) => ({
      episode: entry.value.episode,
      completed: !entry.value.partial,
    })),
  )
  return { tag: 'insert', text: String(episode).padStart(2, '0') }
}
