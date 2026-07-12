import { parseAnlDocument } from '@marucs-anime/core'
import { describe, expect, it } from 'vitest'

import { planNextEpisode } from '../../src/commands/next-episode-plan.js'

describe('next episode plan', () => {
  it('uses completed history across repeated show declarations', () => {
    const document = parseAnlDocument(`01/04/2022
Frieren:
20:00 - 20:24 01
20:25 - 20:40 --
02/04/2022
Frieren:
20:00 - 20:24 09`).document

    expect(planNextEpisode(document, 6)).toEqual({ tag: 'insert', text: '10' })
  })

  it('pads single-digit episodes', () => {
    const document = parseAnlDocument(`01/04/2022
Frieren:
20:00 - 20:24 01`).document
    expect(planNextEpisode(document, 2)).toEqual({ tag: 'insert', text: '02' })
  })

  it('does not insert without show context', () => {
    const document = parseAnlDocument('01/04/2022').document
    expect(planNextEpisode(document, 0)).toEqual({
      reason: 'show-not-found',
      tag: 'no-change',
    })
  })

  it('uses only the supplied document', () => {
    const first = parseAnlDocument(`01/04/2022
Frieren:
20:00 - 20:24 20`).document
    const second = parseAnlDocument(`01/04/2022
Frieren:
20:00 - 20:24 03`).document
    expect(planNextEpisode(first, 2)).toEqual({ tag: 'insert', text: '21' })
    expect(planNextEpisode(second, 2)).toEqual({ tag: 'insert', text: '04' })
  })
})
