import { describe, expect, it } from 'vitest'

import { planTimeInsertion } from '../../src/commands/date-time-plans.js'

describe('time insertion plan', () => {
  it('starts an empty watch-entry line', () => {
    expect(
      planTimeInsertion({
        currentDocumentDate: '02/07/2026',
        lineText: '',
        time: '07:05',
        today: '02/07/2026',
      }),
    ).toEqual({ tag: 'insert', text: '07:05 - ' })
  })

  it('completes start-only lines with or without a dash', () => {
    expect(
      planTimeInsertion({ lineText: '07:05', time: '07:30', today: '02/07/2026' }),
    ).toMatchObject({ tag: 'insert', text: ' - 07:30 ' })
    expect(
      planTimeInsertion({ lineText: '07:05 -', time: '07:30', today: '02/07/2026' }),
    ).toMatchObject({ tag: 'insert', text: ' 07:30 ' })
    expect(
      planTimeInsertion({ lineText: '07:05 - ', time: '07:30', today: '02/07/2026' }),
    ).toMatchObject({ tag: 'insert', text: '07:30 ' })
  })

  it('warns when the document date is different or absent', () => {
    const different = planTimeInsertion({
      currentDocumentDate: '01/07/2026',
      lineText: '',
      time: '07:05',
      today: '02/07/2026',
    })
    expect(different.tag).toBe('insert')
    if (different.tag === 'insert') expect(different.warning).toContain('01/07/2026')

    const absent = planTimeInsertion({ lineText: '', time: '07:05', today: '02/07/2026' })
    expect(absent.tag).toBe('insert')
    if (absent.tag === 'insert') expect(absent.warning).toContain('not defined')
  })

  it('does not edit an already populated line', () => {
    expect(
      planTimeInsertion({ lineText: '07:05 - 07:30 01', time: '08:00', today: '02/07/2026' }),
    ).toEqual({ reason: 'unsupported-line', tag: 'no-change' })
  })
})
