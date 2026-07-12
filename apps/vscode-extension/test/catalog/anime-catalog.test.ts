import { describe, expect, it, vi } from 'vitest'

import {
  type CatalogPolicy,
  type CatalogTransport,
  createAnimeCatalog,
} from '../../src/catalog/anime-catalog.js'

const policy: CatalogPolicy = {
  cacheTtlMs: 100,
  maxCacheEntries: 2,
  minQueryLength: 3,
  minRequestIntervalMs: 10,
  timeoutMs: 10,
}

const payload = (id: number, title: string) => ({ data: [{ mal_id: id, title }] })

describe('anime catalog', () => {
  it('skips short queries and caches normalized successful results', async () => {
    let now = 0
    const transport = vi.fn(() => Promise.resolve(payload(1, 'Frieren')))
    const catalog = createAnimeCatalog(
      { now: () => now, transport, wait: () => Promise.resolve() },
      policy,
    )
    await expect(catalog.search('fr')).resolves.toEqual({ results: [], tag: 'success' })
    await expect(catalog.search(' Frieren ')).resolves.toEqual({
      results: [{ id: 1, title: 'Frieren' }],
      tag: 'success',
    })
    now = 50
    await catalog.search('FRIEREN')
    expect(transport).toHaveBeenCalledTimes(1)
  })

  it('expires and bounds the cache while rate limiting requests', async () => {
    let now = 0
    const wait = vi.fn((milliseconds: number) => {
      now += milliseconds
      return Promise.resolve()
    })
    const transport = vi.fn<CatalogTransport>((query) =>
      Promise.resolve(payload(query.length, query)),
    )
    const catalog = createAnimeCatalog({ now: () => now, transport, wait }, policy)
    await catalog.search('first')
    await catalog.search('second')
    await catalog.search('third')
    now = 200
    await catalog.search('first')
    expect(wait).toHaveBeenCalled()
    expect(transport).toHaveBeenCalledTimes(4)
  })

  it('returns typed invalid-response and network failures', async () => {
    const invalid = createAnimeCatalog(
      {
        now: () => 0,
        transport: () => Promise.resolve({ data: [{ id: 1 }] }),
        wait: () => Promise.resolve(),
      },
      policy,
    )
    await expect(invalid.search('query')).resolves.toEqual({
      failure: { tag: 'invalid-response' },
      tag: 'failure',
    })

    const cause = new Error('offline')
    const network = createAnimeCatalog(
      { now: () => 0, transport: () => Promise.reject(cause), wait: () => Promise.resolve() },
      policy,
    )
    await expect(network.search('query')).resolves.toEqual({
      failure: { cause, tag: 'network' },
      tag: 'failure',
    })
  })

  it('distinguishes timeout from caller cancellation', async () => {
    const never: CatalogTransport = (_query, signal) =>
      new Promise((_resolve, reject) => {
        if (signal.aborted) {
          reject(new Error('aborted'))
          return
        }
        signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
      })
    const catalog = createAnimeCatalog(
      { now: () => 0, transport: never, wait: () => Promise.resolve() },
      { ...policy, timeoutMs: 1 },
    )
    await expect(catalog.search('timeout')).resolves.toEqual({
      failure: { tag: 'timeout' },
      tag: 'failure',
    })

    const abort = new AbortController()
    const request = catalog.search('cancel', abort.signal)
    abort.abort('caller')
    await expect(request).resolves.toEqual({
      failure: { tag: 'cancelled' },
      tag: 'failure',
    })
  })
})
