import type { SourceSpan, TagParameter } from '../parsing/source-line.js'

export type Located<T> = Readonly<{
  line: number
  span: SourceSpan
  value: T
}>

export type AnlTag = Readonly<{
  name: string
  parameters: readonly TagParameter[]
}>

export type WatchEntry = Readonly<{
  date: string
  endTime: string
  episode: number
  partial: boolean
  people: readonly string[]
  startTime: string
  tags: readonly AnlTag[]
}>

export type Show = Readonly<{
  entries: readonly Located<WatchEntry>[]
  firstDeclaration: Located<string>
  mentions: readonly Located<string>[]
  tags: readonly AnlTag[]
  title: string
}>

export type ParsedAnlDocument = Readonly<{
  dates: readonly Located<string>[]
  people: readonly string[]
  shows: readonly Show[]
  tags: readonly string[]
}>
