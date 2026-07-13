import {
  listKnownPeople,
  listKnownTags,
  listShowTitlesByRecentMention,
  type ParsedAnlDocument,
} from '@marucs-anime/core'

export type CompletionKind = 'person' | 'show' | 'tag'

export type LocalCompletion = Readonly<{
  insertText: string
  kind: CompletionKind
  label: string
  replaceFrom: number
}>

export const completionSortText = (index: number): string => String(index).padStart(8, '0')

type CompletionContext = Readonly<{
  kind: CompletionKind
  prefix: string
  replaceFrom: number
}>

const tokenContext = (
  source: string,
  cursor: number,
  open: string,
  close: string,
  kind: CompletionKind,
): CompletionContext | undefined => {
  const beforeCursor = source.slice(0, cursor)
  const openAt = beforeCursor.lastIndexOf(open)
  const closeAt = beforeCursor.lastIndexOf(close)
  if (openAt === -1 || closeAt > openAt) return undefined

  const separatorAt = beforeCursor.lastIndexOf(',')
  const replaceFrom = Math.max(openAt, separatorAt) + 1
  return { kind, prefix: source.slice(replaceFrom, cursor).trimStart(), replaceFrom }
}

const contextAt = (source: string, cursor: number): CompletionContext =>
  tokenContext(source, cursor, '{', '}', 'person') ??
  tokenContext(source, cursor, '[', ']', 'tag') ?? {
    kind: 'show',
    prefix: source.slice(0, cursor).trimStart(),
    replaceFrom: source.slice(0, cursor).length - source.slice(0, cursor).trimStart().length,
  }

const optionsFor = (document: ParsedAnlDocument, kind: CompletionKind): readonly string[] => {
  switch (kind) {
    case 'person':
      return listKnownPeople(document)
    case 'show':
      return listShowTitlesByRecentMention(document)
    case 'tag':
      return listKnownTags(document)
  }
}

const postfixFor = (kind: CompletionKind): string => {
  switch (kind) {
    case 'person':
      return ''
    case 'show':
      return ':'
    case 'tag':
      return ']'
  }
}

export const localCompletionsAt = (
  document: ParsedAnlDocument,
  source: string,
  cursor: number,
): readonly LocalCompletion[] => {
  const context = contextAt(source, cursor)
  const normalizedPrefix = context.prefix.trim().toLocaleLowerCase()
  return optionsFor(document, context.kind)
    .filter((option) => option.toLocaleLowerCase().startsWith(normalizedPrefix))
    .map((option) => ({
      insertText: `${option}${postfixFor(context.kind)}`,
      kind: context.kind,
      label: option,
      replaceFrom: context.replaceFrom,
    }))
}

export const showQueryAt = (source: string, cursor: number): string | undefined => {
  const context = contextAt(source, cursor)
  return context.kind === 'show' ? context.prefix.trim() : undefined
}
