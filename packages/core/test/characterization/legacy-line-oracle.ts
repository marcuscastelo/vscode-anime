export type LegacyLine =
  | Readonly<{ kind: 'date'; value: string }>
  | Readonly<{ kind: 'ignored' }>
  | Readonly<{
      endTime: string
      episode: number | null
      kind: 'watch-entry'
      partial: boolean
      people: readonly string[]
      startTime: string
    }>
  | Readonly<{ kind: 'show'; title: string }>
  | Readonly<{ kind: 'tag'; name: string; parameters: Readonly<Record<string, string>> }>
  | Readonly<{ kind: 'invalid'; reason: string }>

const SHOW = /^\s*([a-zA-Z0-9][^{[}\]]*):\s*$/u
const DATE = /^(\d{2}\/\d{2}\/\d{4})\s*$/u
const WATCH =
  /^([0-9]{2}:[0-9]{2})\s*-\s*([0-9]{2}:[0-9]{2})?\s+([0-9][0-9.]{1,}|--)?\s*(?:\{(.*)\})?\s*$/u
const TAG = /^\s*(?<!\[)\[([^=[\]0-9]+?)(?:\(([^)]+)\))?\](?!\])\s*$/u
const TAG_PARAMETER = /^([^=,0-9]+)=([^),]+)$/u
const VALID_EPISODE = /^(0\d|\d{2,}|--)$/u
const BUILT_IN_TAGS = new Set([
  'COURSE',
  'DORAMA',
  'MANGA',
  'NOT-ANIME',
  'NOT-IN-MAL',
  'REWATCH',
  'SCRIPT-SKIP',
  'UNSAFE-ORDER',
  'WEBTOON',
  '勉強',
])

const parseTagParameters = (
  source: string | undefined,
): Readonly<Record<string, string>> | null => {
  if (source === undefined || source.trim() === '') return {}

  const entries: [string, string][] = []
  for (const token of source.split(',')) {
    const match = TAG_PARAMETER.exec(token)
    if (match?.[1] === undefined || match[2] === undefined) return null
    entries.push([match[1].trim(), match[2].trim()])
  }
  return Object.fromEntries(entries)
}

export const classifyLegacyLine = (source: string): LegacyLine => {
  const commentStart = source.indexOf('//')
  const text = commentStart === -1 ? source : source.slice(0, commentStart)
  if (text.trim() === '') return { kind: 'ignored' }

  const show = SHOW.exec(text)
  if (show?.[1] !== undefined) return { kind: 'show', title: show[1].trim() }

  const date = DATE.exec(text)
  if (date?.[1] !== undefined) return { kind: 'date', value: date[1] }

  const watch = WATCH.exec(text)
  if (watch !== null) {
    const [, startTime, endTime, episodeSource, peopleSource] = watch
    if (startTime === undefined || endTime === undefined || episodeSource === undefined) {
      return { kind: 'invalid', reason: 'incomplete-watch-entry' }
    }
    if (!VALID_EPISODE.test(episodeSource)) {
      return { kind: 'invalid', reason: 'episode-leading-zero' }
    }
    return {
      endTime,
      episode: episodeSource === '--' ? null : Number.parseInt(episodeSource, 10),
      kind: 'watch-entry',
      partial: episodeSource === '--',
      people: peopleSource?.split(',').map((person) => person.trim()) ?? [],
      startTime,
    }
  }

  const tag = TAG.exec(text)
  if (tag?.[1] !== undefined) {
    const name = tag[1].trim()
    if (!BUILT_IN_TAGS.has(name)) return { kind: 'invalid', reason: 'unknown-tag' }
    const parameters = parseTagParameters(tag[2])
    if (parameters === null) return { kind: 'invalid', reason: 'tag-parameters' }
    return { kind: 'tag', name, parameters }
  }

  return { kind: 'invalid', reason: 'unknown-line' }
}

export const classifyLegacyDocument = (source: string): readonly LegacyLine[] =>
  source.split(/\r?\n/u).map(classifyLegacyLine)

export const nextCompletedEpisode = (lines: readonly LegacyLine[]): number =>
  lines.reduce(
    (latest, line) =>
      line.kind === 'watch-entry' && !line.partial && line.episode !== null
        ? Math.max(latest, line.episode)
        : latest,
    0,
  ) + 1
