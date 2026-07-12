import { describe, expect, it } from 'vitest'

import { classifySourceLine } from '../src/index.js'

describe('core package boundary', () => {
  it('loads without the VS Code runtime', () => {
    expect(typeof classifySourceLine).toBe('function')
  })
})
