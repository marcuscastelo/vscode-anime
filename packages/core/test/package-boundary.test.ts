import { describe, expect, it } from 'vitest'

import { CORE_PACKAGE_NAME } from '../src/index.js'

describe('core package boundary', () => {
  it('loads without the VS Code runtime', () => {
    expect(CORE_PACKAGE_NAME).toBe('@marucs-anime/core')
  })
})
