export type SourcePosition = Readonly<{
  column: number
  offset: number
}>

export type SourceSpan = Readonly<{
  end: SourcePosition
  start: SourcePosition
}>

export type SourceLine = Readonly<{
  line: number
  offset: number
  text: string
}>

export type TagParameter = Readonly<{
  name: string
  value: string
}>

type LocatedLine = Readonly<{
  line: number
  span: SourceSpan
}>

export type IgnoredSourceLine = LocatedLine &
  Readonly<{
    kind: 'ignored'
  }>

export type DateSourceLine = LocatedLine &
  Readonly<{
    date: string
    kind: 'date'
  }>

export type ShowSourceLine = LocatedLine &
  Readonly<{
    kind: 'show'
    title: string
  }>

export type WatchEntrySourceLine = LocatedLine &
  Readonly<{
    endTime: string
    episode: number | null
    kind: 'watch-entry'
    partial: boolean
    people: readonly string[]
    startTime: string
  }>

export type TagSourceLine = LocatedLine &
  Readonly<{
    kind: 'tag'
    name: string
    parameters: readonly TagParameter[]
  }>

export type InvalidSourceLine = LocatedLine &
  Readonly<{
    code: 'invalid-tag-parameters' | 'invalid-watch-entry' | 'unknown-line'
    kind: 'invalid'
  }>

export type ClassifiedSourceLine =
  | DateSourceLine
  | IgnoredSourceLine
  | InvalidSourceLine
  | ShowSourceLine
  | TagSourceLine
  | WatchEntrySourceLine
