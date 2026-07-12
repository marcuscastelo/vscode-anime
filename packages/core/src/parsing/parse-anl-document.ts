import type { AnlDiagnostic, DiagnosticCode } from '../diagnostics/diagnostic.js'
import type {
  AnlTag,
  Located,
  ParsedAnlDocument,
  Show,
  WatchEntry,
} from '../domain/anl-document.js'
import { findTagDefinition } from '../domain/tags.js'
import { classifySourceLine } from './classify-source-line.js'
import type { ClassifiedSourceLine, SourceLine, SourceSpan, TagSourceLine } from './source-line.js'

export type ParseAnlResult = Readonly<{
  diagnostics: readonly AnlDiagnostic[]
  document: ParsedAnlDocument
}>

type ParserState = Readonly<{
  currentDate: Located<string> | undefined
  currentShow: string | undefined
  dates: readonly Located<string>[]
  diagnostics: readonly AnlDiagnostic[]
  pendingTags: readonly TagSourceLine[]
  shows: ReadonlyMap<string, Show>
}>

const initialState = (): ParserState => ({
  currentDate: undefined,
  currentShow: undefined,
  dates: [],
  diagnostics: [],
  pendingTags: [],
  shows: new Map(),
})

const diagnostic = (
  code: DiagnosticCode,
  line: number,
  span: SourceSpan,
  message: string,
  severity: AnlDiagnostic['severity'] = 'error',
): AnlDiagnostic => ({ code, line, message, severity, span })

const appendDiagnostic = (state: ParserState, value: AnlDiagnostic): ParserState => ({
  ...state,
  diagnostics: [...state.diagnostics, value],
})

const asLocated = <T>(line: number, span: SourceSpan, value: T): Located<T> => ({
  line,
  span,
  value,
})

const validDate = (source: string): Date | null => {
  const [daySource, monthSource, yearSource] = source.split('/')
  if (daySource === undefined || monthSource === undefined || yearSource === undefined) return null

  const day = Number.parseInt(daySource, 10)
  const month = Number.parseInt(monthSource, 10)
  const year = Number.parseInt(yearSource, 10)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date
    : null
}

const validTime = (source: string): boolean => {
  const match = /^(\d{2}):(\d{2})$/u.exec(source)
  if (match?.[1] === undefined || match[2] === undefined) return false
  return Number(match[1]) <= 23 && Number(match[2]) <= 59
}

const applyDate = (
  state: ParserState,
  line: Extract<ClassifiedSourceLine, { kind: 'date' }>,
): ParserState => {
  const parsed = validDate(line.date)
  let next = state
  if (parsed === null) {
    next = appendDiagnostic(
      next,
      diagnostic('invalid-date', line.line, line.span, `Invalid calendar date: ${line.date}`),
    )
  }

  const previous = state.currentDate
  if (previous?.value === line.date) {
    next = appendDiagnostic(
      next,
      diagnostic(
        'redundant-date',
        line.line,
        line.span,
        'Date repeats the current date',
        'warning',
      ),
    )
  } else if (previous !== undefined && parsed !== null) {
    const previousDate = validDate(previous.value)
    if (previousDate !== null && parsed.getTime() < previousDate.getTime()) {
      next = appendDiagnostic(
        next,
        diagnostic(
          'date-out-of-order',
          line.line,
          line.span,
          'Date is older than the previous date',
        ),
      )
    }
  }

  const located = asLocated(line.line, line.span, line.date)
  return {
    ...next,
    currentDate: located,
    currentShow: undefined,
    dates: [...state.dates, located],
  }
}

const tagValue = (line: TagSourceLine): AnlTag => ({
  name: line.name,
  parameters: line.parameters,
})

const applyShow = (
  state: ParserState,
  line: Extract<ClassifiedSourceLine, { kind: 'show' }>,
): ParserState => {
  const existing = state.shows.get(line.title)
  const mention = asLocated(line.line, line.span, line.title)
  const showTags = state.pendingTags
    .filter((tag) => findTagDefinition(tag.name)?.target === 'show')
    .map(tagValue)
  const show: Show =
    existing === undefined
      ? {
          entries: [],
          firstDeclaration: mention,
          mentions: [mention],
          tags: showTags,
          title: line.title,
        }
      : { ...existing, mentions: [...existing.mentions, mention] }
  const shows = new Map(state.shows)
  shows.set(show.title, show)
  return {
    ...state,
    currentShow: show.title,
    pendingTags: state.pendingTags.filter((tag) => findTagDefinition(tag.name)?.target !== 'show'),
    shows,
  }
}

const lastCompletedEpisode = (show: Show): number =>
  show.entries.reduce(
    (latest, entry) => (!entry.value.partial ? Math.max(latest, entry.value.episode) : latest),
    0,
  )

const applyWatchEntry = (
  state: ParserState,
  line: Extract<ClassifiedSourceLine, { kind: 'watch-entry' }>,
): ParserState => {
  if (state.currentDate === undefined) {
    return appendDiagnostic(
      state,
      diagnostic(
        'watch-entry-without-date',
        line.line,
        line.span,
        'Watch entry has no current date',
      ),
    )
  }
  if (state.currentShow === undefined) {
    return appendDiagnostic(
      state,
      diagnostic(
        'watch-entry-without-show',
        line.line,
        line.span,
        'Watch entry has no current show',
      ),
    )
  }

  const show = state.shows.get(state.currentShow)
  if (show === undefined) return state

  const timeDiagnostics = [line.startTime, line.endTime]
    .filter((time) => !validTime(time))
    .map((time) => diagnostic('invalid-time', line.line, line.span, `Invalid time: ${time}`))
  const entry: WatchEntry = {
    date: state.currentDate.value,
    endTime: line.endTime,
    episode: line.episode ?? lastCompletedEpisode(show) + 1,
    partial: line.partial,
    people: line.people,
    startTime: line.startTime,
    tags: state.pendingTags
      .filter((tag) => findTagDefinition(tag.name)?.target === 'watch-entry')
      .map(tagValue),
  }
  const shows = new Map(state.shows)
  shows.set(show.title, {
    ...show,
    entries: [...show.entries, asLocated(line.line, line.span, entry)],
  })
  return {
    ...state,
    diagnostics: [...state.diagnostics, ...timeDiagnostics],
    pendingTags: state.pendingTags.filter(
      (tag) => findTagDefinition(tag.name)?.target !== 'watch-entry',
    ),
    shows,
  }
}

const applyTag = (state: ParserState, line: TagSourceLine): ParserState => {
  if (findTagDefinition(line.name) === undefined) {
    return appendDiagnostic(
      state,
      diagnostic('unknown-tag', line.line, line.span, `Unknown tag: ${line.name}`),
    )
  }
  return { ...state, pendingTags: [...state.pendingTags, line] }
}

const applyLine = (state: ParserState, line: ClassifiedSourceLine): ParserState => {
  switch (line.kind) {
    case 'date':
      return applyDate(state, line)
    case 'ignored':
      return state
    case 'invalid':
      return appendDiagnostic(
        state,
        diagnostic(line.code, line.line, line.span, 'Invalid ANL line'),
      )
    case 'show':
      return applyShow(state, line)
    case 'tag':
      return applyTag(state, line)
    case 'watch-entry':
      return applyWatchEntry(state, line)
  }
}

const sourceLines = (source: string): readonly SourceLine[] => {
  let offset = 0
  return source.split(/\r?\n/u).map((text, line) => {
    const sourceLine = { line, offset, text }
    offset += text.length + 1
    return sourceLine
  })
}

export const parseAnlDocument = (source: string): ParseAnlResult => {
  const finalState = sourceLines(source).map(classifySourceLine).reduce(applyLine, initialState())
  const shows = [...finalState.shows.values()]
  return {
    diagnostics: finalState.diagnostics,
    document: {
      dates: finalState.dates,
      people: [
        ...new Set(shows.flatMap((show) => show.entries.flatMap((entry) => entry.value.people))),
      ],
      shows,
      tags: [...new Set(shows.flatMap((show) => show.tags.map((tag) => tag.name)))],
    },
  }
}
