import { describe, expect, it } from 'vitest'

import {
  calculateNextEpisode,
  findShowAtLine,
  listKnownPeople,
  listKnownTags,
  listShowTitlesByRecentMention,
  parseAnlDocument,
} from '../../src/index.js'

const source = `01/04/2022

Older Show:
20:00 - 20:24 01 {alice}

Newer Show:
20:25 - 20:49 09 {bob}
20:50 - 21:00 --

Older Show:
21:01 - 21:25 02 {alice, carol}
02/04/2022

Newer Show:
22:00 - 22:24 10`

const document = parseAnlDocument(source).document

describe('document queries', () => {
  it('calculates next episode from completed entries only', () => {
    expect(calculateNextEpisode(document, 'Newer Show')).toEqual({ episode: 11, tag: 'found' })
    expect(calculateNextEpisode(document, 'Missing')).toEqual({ tag: 'show-not-found' })
  })

  it('ranks show titles by their most recent mention', () => {
    expect(listShowTitlesByRecentMention(document)).toEqual(['Newer Show', 'Older Show'])
  })

  it('returns unique people in encounter order', () => {
    expect(listKnownPeople(document)).toEqual(['alice', 'bob', 'carol'])
  })

  it('lists every built-in tag', () => {
    expect(listKnownTags(document)).toEqual([
      'NOT-ANIME',
      'NOT-IN-MAL',
      'MANGA',
      'WEBTOON',
      'COURSE',
      'DORAMA',
      '勉強',
      'REWATCH',
      'UNSAFE-ORDER',
      'SCRIPT-SKIP',
    ])
  })

  it('resolves cursor context and respects date resets', () => {
    expect(findShowAtLine(document, 10)?.title).toBe('Older Show')
    expect(findShowAtLine(document, 12)).toBeUndefined()
    expect(findShowAtLine(document, 15)?.title).toBe('Newer Show')
  })
})
