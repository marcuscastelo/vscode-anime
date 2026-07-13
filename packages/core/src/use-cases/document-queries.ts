import type { ParsedAnlDocument, Show } from '../domain/anl-document.js'
import { DEFAULT_TAGS } from '../domain/tags.js'

export type NextEpisodeResult =
  | Readonly<{ episode: number; tag: 'found' }>
  | Readonly<{ tag: 'show-not-found' }>

const latestMentionLine = (show: Show): number => show.mentions.at(-1)?.line ?? -1

export const findShow = (document: ParsedAnlDocument, title: string): Show | undefined =>
  document.shows.find((show) => show.title === title)

export const findShowAtLine = (document: ParsedAnlDocument, line: number): Show | undefined => {
  const latestDateLine = document.dates
    .filter((date) => date.line <= line)
    .reduce((latest, date) => Math.max(latest, date.line), -1)
  return document.shows
    .filter((show) => show.mentions.some((mention) => mention.line <= line))
    .map((show) => ({
      mentionLine: Math.max(
        ...show.mentions.filter((mention) => mention.line <= line).map((item) => item.line),
      ),
      show,
    }))
    .filter((candidate) => candidate.mentionLine > latestDateLine)
    .sort((left, right) => right.mentionLine - left.mentionLine)[0]?.show
}

export const calculateNextEpisode = (
  document: ParsedAnlDocument,
  showTitle: string,
): NextEpisodeResult => {
  const show = findShow(document, showTitle)
  if (show === undefined) return { tag: 'show-not-found' }

  const latest = show.entries.reduce(
    (episode, entry) => (!entry.value.partial ? Math.max(episode, entry.value.episode) : episode),
    0,
  )
  return { episode: latest + 1, tag: 'found' }
}

export const listShowTitlesByRecentMention = (document: ParsedAnlDocument): readonly string[] =>
  [...document.shows]
    .sort((left, right) => latestMentionLine(right) - latestMentionLine(left))
    .map((show) => show.title)

export const listKnownPeople = (document: ParsedAnlDocument): readonly string[] => document.people

export const listKnownTags = (document: ParsedAnlDocument): readonly string[] => [
  ...new Set([...DEFAULT_TAGS.map((tag) => tag.name), ...document.tags]),
]
