import { parseAnlDocument } from '@marucs-anime/core'
import { describe, expect, it } from 'vitest'

import {
  definitionInsightForTitle,
  hoverInsightAtLine,
  listDocumentSymbolInsights,
} from '../../src/providers/document-insight.js'

const document = parseAnlDocument(`01/04/2022
Frieren:
20:00 - 20:24 01 {alice}
20:25 - 20:49 02
Frieren:`).document

describe('document insight', () => {
  it('lists every show mention as a symbol', () => {
    expect(
      listDocumentSymbolInsights(document).map((symbol) => [symbol.name, symbol.line]),
    ).toEqual([
      ['Frieren', 1],
      ['Frieren', 4],
    ])
  })

  it('resolves definitions to the first declaration', () => {
    expect(definitionInsightForTitle(document, 'Frieren')?.line).toBe(1)
    expect(definitionInsightForTitle(document, 'Missing')).toBeUndefined()
  })

  it('builds hover information from the supplied document and line', () => {
    expect(hoverInsightAtLine(document, 4)).toEqual({
      completedEpisodes: 2,
      latestEpisode: 2,
      people: ['alice'],
      title: 'Frieren',
    })
    expect(hoverInsightAtLine(document, 0)).toBeUndefined()
  })
})
