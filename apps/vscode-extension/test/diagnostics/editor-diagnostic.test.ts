import { describe, expect, it } from 'vitest'

import { toEditorDiagnostic } from '../../src/diagnostics/editor-diagnostic.js'

describe('diagnostic mapping', () => {
  it('maps core spans without importing VS Code', () => {
    expect(
      toEditorDiagnostic({
        code: 'unknown-line',
        line: 3,
        message: 'Invalid ANL line',
        severity: 'error',
        span: {
          end: { column: 8, offset: 28 },
          start: { column: 0, offset: 20 },
        },
      }),
    ).toEqual({
      code: 'unknown-line',
      message: 'Invalid ANL line',
      range: {
        end: { character: 8, line: 3 },
        start: { character: 0, line: 3 },
      },
      severity: 'error',
    })
  })
})
