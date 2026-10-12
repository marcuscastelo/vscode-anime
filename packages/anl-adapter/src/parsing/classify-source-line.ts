import type { ClassifiedSourceLine, SourceLine, SourceSpan, TagParameter } from './source-line.js'

const DATE = /^(\d{2}\/\d{2}\/\d{4})\s*$/u
const WATCH =
  /^([0-9]{2}:[0-9]{2})\s*-\s*([0-9]{2}:[0-9]{2})?\s+([0-9][0-9.]{1,}|--)?\s*(?:\{(.*)\})?\s*$/u
const TAG = /^\s*(?<!\[)\[([^=[\]0-9]+?)(?:\(([^)]+)\))?\](?!\])\s*$/u
const TAG_PARAMETER = /^([^=,0-9]+)=([^),]+)$/u
const VALID_EPISODE = /^(0\d|\d{2,}|--)$/u

const spanOf = (source: SourceLine): SourceSpan => ({
  end: { column: source.text.length, offset: source.offset + source.text.length },
  start: { column: 0, offset: source.offset },
})

const withoutComment = (text: string): string => {
  const commentStart = text.indexOf('//')
  return commentStart === -1 ? text : text.slice(0, commentStart)
}

const showTitle = (text: string): string | null => {
  const trimmed = text.trim()
  if (!trimmed.endsWith(':')) return null

  const title = trimmed.slice(0, -1).trim()
  if (title === '' || /[[\]{}]/u.test(title)) return null
  return title
}

const parseTagParameters = (source: string | undefined): readonly TagParameter[] | null => {
  if (source === undefined || source.trim() === '') return []

  const parameters: TagParameter[] = []
  for (const token of source.split(',')) {
    const match = TAG_PARAMETER.exec(token)
    if (match?.[1] === undefined || match[2] === undefined) return null
    parameters.push({ name: match[1].trim(), value: match[2].trim() })
  }
  return parameters
}

export const classifySourceLine = (source: SourceLine): ClassifiedSourceLine => {
  const span = spanOf(source)
  const text = withoutComment(source.text)
  if (text.trim() === '') return { kind: 'ignored', line: source.line, span }

  const date = DATE.exec(text)
  if (date?.[1] !== undefined) {
    return { date: date[1], kind: 'date', line: source.line, span }
  }

  const watch = WATCH.exec(text)
  if (watch !== null) {
    const [, startTime, endTime, episodeSource, peopleSource] = watch
    if (
      startTime === undefined ||
      endTime === undefined ||
      episodeSource === undefined ||
      !VALID_EPISODE.test(episodeSource)
    ) {
      return { code: 'invalid-watch-entry', kind: 'invalid', line: source.line, span }
    }
    return {
      endTime,
      episode: episodeSource === '--' ? null : Number.parseInt(episodeSource, 10),
      kind: 'watch-entry',
      line: source.line,
      partial: episodeSource === '--',
      people: peopleSource?.split(',').map((person) => person.trim()) ?? [],
      span,
      startTime,
    }
  }

  const tag = TAG.exec(text)
  if (tag?.[1] !== undefined) {
    const parameters = parseTagParameters(tag[2])
    if (parameters === null) {
      return { code: 'invalid-tag-parameters', kind: 'invalid', line: source.line, span }
    }
    return { kind: 'tag', line: source.line, name: tag[1].trim(), parameters, span }
  }

  const title = showTitle(text)
  if (title !== null) return { kind: 'show', line: source.line, span, title }

  return { code: 'unknown-line', kind: 'invalid', line: source.line, span }
}
