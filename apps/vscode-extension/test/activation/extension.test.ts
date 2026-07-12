import { describe, expect, it, vi } from 'vitest'
import type { ExtensionContext } from 'vscode'

import { activate } from '../../src/extension.js'

describe('extension activation', () => {
  it('registers the application lifecycle in extension subscriptions', () => {
    const subscriptions: { dispose: () => void }[] = []
    const context = { subscriptions } as unknown as ExtensionContext
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    activate(context)
    expect(subscriptions).toHaveLength(1)
    expect(info).toHaveBeenCalledWith('Marucs Anime activated')

    subscriptions[0]?.dispose()
    expect(info).toHaveBeenCalledWith('Marucs Anime deactivated')
    info.mockRestore()
  })
})
