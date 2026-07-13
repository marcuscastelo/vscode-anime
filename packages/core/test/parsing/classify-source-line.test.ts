import { describe, expect, it } from 'vitest'

import { classifySourceLine, type SourceLine } from '../../src/index.js'

const line = (text: string, lineNumber = 0, offset = 0): SourceLine => ({
  line: lineNumber,
  offset,
  text,
})

describe('classifySourceLine', () => {
  it('classifies blank and comment lines as ignored', () => {
    expect(classifySourceLine(line('   // comment'))).toMatchObject({ kind: 'ignored' })
  })

  it('classifies a date and keeps its source span', () => {
    expect(classifySourceLine(line('09/03/2022', 2, 20))).toEqual({
      date: '09/03/2022',
      kind: 'date',
      line: 2,
      span: {
        end: { column: 10, offset: 30 },
        start: { column: 0, offset: 20 },
      },
    })
  })

  it('supports Unicode show titles', () => {
    expect(classifySourceLine(line('進撃の巨人:'))).toMatchObject({
      kind: 'show',
      title: '進撃の巨人',
    })
  })

  it('classifies complete and partial watch entries', () => {
    expect(classifySourceLine(line('23:05 - 23:30 01 {alice, bob}'))).toMatchObject({
      endTime: '23:30',
      episode: 1,
      kind: 'watch-entry',
      partial: false,
      people: ['alice', 'bob'],
      startTime: '23:05',
    })
    expect(classifySourceLine(line('23:30 - 23:45 --'))).toMatchObject({
      episode: null,
      kind: 'watch-entry',
      partial: true,
    })
  })

  it('classifies tags without applying semantic registration rules', () => {
    expect(classifySourceLine(line('[SCRIPT-SKIP(count=100)]'))).toMatchObject({
      kind: 'tag',
      name: 'SCRIPT-SKIP',
      parameters: [{ name: 'count', value: '100' }],
    })
    expect(classifySourceLine(line('[FUTURE-TAG]'))).toMatchObject({
      kind: 'tag',
      name: 'FUTURE-TAG',
    })
  })

  it('returns typed invalid results instead of throwing', () => {
    expect(classifySourceLine(line('not anl'))).toMatchObject({
      code: 'unknown-line',
      kind: 'invalid',
    })
    expect(classifySourceLine(line('[TAG(invalid)]'))).toMatchObject({
      code: 'invalid-tag-parameters',
      kind: 'invalid',
    })
  })
})
