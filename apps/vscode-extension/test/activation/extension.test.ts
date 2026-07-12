import { describe, expect, it } from 'vitest'
import type { ExtensionContext } from 'vscode'

describe('extension activation contract', () => {
  it('keeps the ExtensionContext contract compile-time visible', () => {
    const acceptsContext = (_context: ExtensionContext): true => true
    expect(typeof acceptsContext).toBe('function')
  })
})
