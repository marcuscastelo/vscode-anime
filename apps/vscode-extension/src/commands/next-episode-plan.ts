import { calculateNextEpisode, findShowAtLine, type ParsedAnlDocument } from '@marucs-anime/core'

export type NextEpisodePlan =
  | Readonly<{ reason: 'show-not-found'; tag: 'no-change' }>
  | Readonly<{ text: string; tag: 'insert' }>

export const planNextEpisode = (document: ParsedAnlDocument, line: number): NextEpisodePlan => {
  const show = findShowAtLine(document, line)
  if (show === undefined) return { reason: 'show-not-found', tag: 'no-change' }

  const result = calculateNextEpisode(document, show.title)
  return result.tag === 'show-not-found'
    ? { reason: 'show-not-found', tag: 'no-change' }
    : { tag: 'insert', text: String(result.episode).padStart(2, '0') }
}
