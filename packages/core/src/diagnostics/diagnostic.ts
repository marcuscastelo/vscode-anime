import type { SourceSpan } from '../parsing/source-line.js'

export type DiagnosticSeverity = 'error' | 'warning'

export type DiagnosticCode =
  | 'date-out-of-order'
  | 'invalid-date'
  | 'invalid-tag-parameters'
  | 'invalid-time'
  | 'invalid-watch-entry'
  | 'redundant-date'
  | 'unknown-line'
  | 'unknown-tag'
  | 'watch-entry-without-date'
  | 'watch-entry-without-show'

export type AnlDiagnostic = Readonly<{
  code: DiagnosticCode
  line: number
  message: string
  severity: DiagnosticSeverity
  span: SourceSpan
}>
