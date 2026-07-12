export type AnimeSearchResult = Readonly<{ id: number; title: string }>
export type CatalogFailure =
  | Readonly<{ tag: 'cancelled' }>
  | Readonly<{ tag: 'invalid-response' }>
  | Readonly<{ cause: unknown; tag: 'network' }>
  | Readonly<{ tag: 'timeout' }>
export type CatalogResult =
  | Readonly<{ results: readonly AnimeSearchResult[]; tag: 'success' }>
  | Readonly<{ failure: CatalogFailure; tag: 'failure' }>
export type AnimeCatalog = Readonly<{
  search: (query: string, signal?: AbortSignal) => Promise<CatalogResult>
}>
export type CatalogTransport = (query: string, signal: AbortSignal) => Promise<unknown>
export type CatalogDependencies = Readonly<{
  now: () => number
  transport: CatalogTransport
  wait: (milliseconds: number, signal: AbortSignal) => Promise<void>
}>
export type CatalogPolicy = Readonly<{
  cacheTtlMs: number
  maxCacheEntries: number
  minQueryLength: number
  minRequestIntervalMs: number
  timeoutMs: number
}>

type CacheEntry = Readonly<{ expiresAt: number; results: readonly AnimeSearchResult[] }>

export const DEFAULT_CATALOG_POLICY: CatalogPolicy = {
  cacheTtlMs: 24 * 60 * 60 * 1_000,
  maxCacheEntries: 100,
  minQueryLength: 3,
  minRequestIntervalMs: 1_000,
  timeoutMs: 5_000,
}

export const abortableWait = (milliseconds: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, milliseconds)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout)
        reject(signal.reason instanceof Error ? signal.reason : new Error('Request aborted'))
      },
      { once: true },
    )
  })

const decodeResults = (input: unknown): readonly AnimeSearchResult[] | null => {
  if (
    typeof input !== 'object' ||
    input === null ||
    !('data' in input) ||
    !Array.isArray(input.data)
  ) {
    return null
  }
  const data: readonly unknown[] = input.data
  const results: AnimeSearchResult[] = []
  for (const item of data) {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('mal_id' in item) ||
      typeof item.mal_id !== 'number' ||
      !('title' in item) ||
      typeof item.title !== 'string'
    ) {
      return null
    }
    results.push({ id: item.mal_id, title: item.title })
  }
  return results
}

export const createAnimeCatalog = (
  dependencies: CatalogDependencies,
  policy: CatalogPolicy = DEFAULT_CATALOG_POLICY,
): AnimeCatalog => {
  const cache = new Map<string, CacheEntry>()
  let lastRequestAt = Number.NEGATIVE_INFINITY

  const cacheResult = (query: string, results: readonly AnimeSearchResult[]): void => {
    cache.delete(query)
    cache.set(query, { expiresAt: dependencies.now() + policy.cacheTtlMs, results })
    while (cache.size > policy.maxCacheEntries) {
      const oldest: string | undefined = cache.keys().next().value
      if (oldest === undefined) break
      cache.delete(oldest)
    }
  }

  return {
    search: async (rawQuery, outerSignal) => {
      const query = rawQuery.trim().toLocaleLowerCase()
      if (query.length < policy.minQueryLength) return { results: [], tag: 'success' }

      const cached = cache.get(query)
      if (cached !== undefined && cached.expiresAt > dependencies.now()) {
        cache.delete(query)
        cache.set(query, cached)
        return { results: cached.results, tag: 'success' }
      }
      cache.delete(query)

      const controller = new AbortController()
      const cancel = (): void => controller.abort(outerSignal?.reason ?? 'cancelled')
      outerSignal?.addEventListener('abort', cancel, { once: true })
      const timeout = setTimeout(() => controller.abort('timeout'), policy.timeoutMs)

      try {
        const waitMs = Math.max(
          0,
          policy.minRequestIntervalMs - (dependencies.now() - lastRequestAt),
        )
        if (waitMs > 0) await dependencies.wait(waitMs, controller.signal)
        if (controller.signal.aborted) throw controller.signal.reason
        lastRequestAt = dependencies.now()
        const response = await dependencies.transport(query, controller.signal)
        const results = decodeResults(response)
        if (results === null) return { failure: { tag: 'invalid-response' }, tag: 'failure' }
        cacheResult(query, results)
        return { results, tag: 'success' }
      } catch (cause) {
        if (controller.signal.reason === 'timeout') {
          return { failure: { tag: 'timeout' }, tag: 'failure' }
        }
        if (outerSignal?.aborted === true) {
          return { failure: { tag: 'cancelled' }, tag: 'failure' }
        }
        return { failure: { cause, tag: 'network' }, tag: 'failure' }
      } finally {
        clearTimeout(timeout)
        outerSignal?.removeEventListener('abort', cancel)
      }
    },
  }
}
