import type { AnlDiagnostic } from '@marucs-anime/core'

export type EditorDiagnostic = Readonly<{
  code: string
  message: string
  range: Readonly<{
    end: Readonly<{ character: number; line: number }>
    start: Readonly<{ character: number; line: number }>
  }>
  severity: 'error' | 'warning'
}>

export const toEditorDiagnostic = (diagnostic: AnlDiagnostic): EditorDiagnostic => ({
  code: diagnostic.code,
  message: diagnostic.message,
  range: {
    end: { character: diagnostic.span.end.column, line: diagnostic.line },
    start: { character: diagnostic.span.start.column, line: diagnostic.line },
  },
  severity: diagnostic.severity,
})
