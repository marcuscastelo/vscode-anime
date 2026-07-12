import { parseAnlDocument } from '@marucs-anime/core'
import { describe, expect, it } from 'vitest'

import { localCompletionsAt, showQueryAt } from '../../src/completion/local-completion.js'

const document = parseAnlDocument(`01/04/2022
Older Show:
20:00 - 20:24 01 {alice}
Newer Show:
20:25 - 20:49 01 {bob}`).document

describe('local completion', () => {
  it('ranks recent shows and filters by typed prefix', () => {
    expect(localCompletionsAt(document, '', 0).map((item) => item.label)).toEqual([
      'Newer Show',
      'Older Show',
    ])
    expect(localCompletionsAt(document, 'Old', 3)).toEqual([
      {
        insertText: 'Older Show:',
        kind: 'show',
        label: 'Older Show',
        replaceFrom: 0,
      },
    ])
  })

  it('completes people inside company braces', () => {
    expect(localCompletionsAt(document, '20:00 - 20:24 02 {a', 22)).toEqual([
      { insertText: 'alice', kind: 'person', label: 'alice', replaceFrom: 18 },
    ])
  })

  it('completes built-in tags inside brackets', () => {
    expect(localCompletionsAt(document, '[REW', 4)).toEqual([
      { insertText: 'REWATCH]', kind: 'tag', label: 'REWATCH', replaceFrom: 1 },
    ])
  })

  it('returns an empty list when no option matches', () => {
    expect(localCompletionsAt(document, 'zzz', 3)).toEqual([])
  })

  it('exposes remote queries only in show-title context', () => {
    expect(showQueryAt('Fri', 3)).toBe('Fri')
    expect(showQueryAt('{ali', 4)).toBeUndefined()
    expect(showQueryAt('[REW', 4)).toBeUndefined()
  })
})
