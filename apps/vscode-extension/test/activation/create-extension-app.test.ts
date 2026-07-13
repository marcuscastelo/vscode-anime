import { describe, expect, it, vi } from 'vitest'

import { createExtensionApp } from '../../src/activation/create-extension-app.js'

describe('createExtensionApp', () => {
  it('activates and disposes exactly once', () => {
    const log = vi.fn()
    const dispose = vi.fn()
    const start = vi.fn(() => [{ dispose }])
    const app = createExtensionApp({ log, start })

    app.activate()
    app.activate()
    app.dispose()
    app.dispose()

    expect(log.mock.calls).toEqual([['Marucs Anime activated'], ['Marucs Anime deactivated']])
    expect(start).toHaveBeenCalledTimes(1)
    expect(dispose).toHaveBeenCalledTimes(1)
  })
})
