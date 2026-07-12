import { describe, expect, it, vi } from 'vitest'

import { createJikanTransport } from '../../src/catalog/jikan-transport.js'

describe('Jikan transport', () => {
  it('builds an encoded request and decodes JSON', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 })),
    )
    const transport = createJikanTransport(fetchImplementation)
    await expect(transport('full metal', new AbortController().signal)).resolves.toEqual({
      data: [],
    })
    const request = fetchImplementation.mock.calls[0]?.[0]
    const requestUrl =
      request instanceof URL ? request.href : typeof request === 'string' ? request : request?.url
    expect(requestUrl).toContain('q=full+metal')
  })

  it('rejects HTTP errors and oversized responses', async () => {
    const failed = createJikanTransport(() => Promise.resolve(new Response('', { status: 500 })))
    await expect(failed('query', new AbortController().signal)).rejects.toThrow('status 500')

    const oversized = createJikanTransport(() =>
      Promise.resolve(new Response('{}', { headers: { 'content-length': '1000001' } })),
    )
    await expect(oversized('query', new AbortController().signal)).rejects.toThrow('too large')
  })
})
