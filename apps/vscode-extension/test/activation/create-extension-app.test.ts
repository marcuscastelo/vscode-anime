import { describe, expect, it, vi } from 'vitest'

import { createExtensionApp } from '../../src/activation/create-extension-app.js'

describe('createExtensionApp', () => {
  it('activates and disposes exactly once', () => {
    const log = vi.fn()
    const app = createExtensionApp({ log })

    app.activate()
    app.activate()
    app.dispose()
    app.dispose()

    expect(log.mock.calls).toEqual([['Marucs Anime activated'], ['Marucs Anime deactivated']])
  })
})
