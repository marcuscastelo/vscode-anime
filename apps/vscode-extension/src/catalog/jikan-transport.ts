import type { CatalogTransport } from './anime-catalog.js'

const MAX_RESPONSE_CHARACTERS = 1_000_000

export const createJikanTransport =
  (fetchImplementation: typeof fetch = fetch): CatalogTransport =>
  async (query, signal) => {
    const url = new URL('https://api.jikan.moe/v4/anime')
    url.searchParams.set('q', query)
    url.searchParams.set('order_by', 'members')
    url.searchParams.set('sort', 'desc')
    const response = await fetchImplementation(url, { signal })
    if (!response.ok) throw new Error(`Jikan request failed with status ${response.status}`)

    const declaredSize = Number(response.headers.get('content-length') ?? 0)
    if (declaredSize > MAX_RESPONSE_CHARACTERS) throw new Error('Jikan response is too large')
    const text = await response.text()
    if (text.length > MAX_RESPONSE_CHARACTERS) throw new Error('Jikan response is too large')
    return JSON.parse(text) as unknown
  }
