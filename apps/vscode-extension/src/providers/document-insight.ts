import {
  findShow,
  findShowAtLine,
  type ParsedAnlDocument,
  type SourceSpan,
} from '@marucs-anime/core'

export type DocumentSymbolInsight = Readonly<{ line: number; name: string; span: SourceSpan }>
export type DefinitionInsight = Readonly<{ line: number; span: SourceSpan }>
export type HoverInsight = Readonly<{
  completedEpisodes: number
  latestEpisode?: number
  people: readonly string[]
  title: string
}>

export const listDocumentSymbolInsights = (
  document: ParsedAnlDocument,
): readonly DocumentSymbolInsight[] =>
  document.shows.flatMap((show) =>
    show.mentions.map((mention) => ({ line: mention.line, name: show.title, span: mention.span })),
  )

export const definitionInsightForTitle = (
  document: ParsedAnlDocument,
  title: string,
): DefinitionInsight | undefined => {
  const show = findShow(document, title)
  return show === undefined
    ? undefined
    : { line: show.firstDeclaration.line, span: show.firstDeclaration.span }
}

export const hoverInsightAtLine = (
  document: ParsedAnlDocument,
  line: number,
): HoverInsight | undefined => {
  const show = findShowAtLine(document, line)
  if (show === undefined) return undefined

  const completed = show.entries.filter((entry) => !entry.value.partial)
  const latest = completed.at(-1)
  return {
    completedEpisodes: completed.length,
    ...(latest === undefined ? {} : { latestEpisode: latest.value.episode }),
    people: [...new Set(show.entries.flatMap((entry) => entry.value.people))],
    title: show.title,
  }
}
