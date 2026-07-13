import { describe, expect, it } from 'vitest'

import { formatLocalDate, formatLocalTime } from '../../src/clock/clock.js'

describe('local clock formatting', () => {
  it('formats date and time without ambient locale formatting', () => {
    const date = new Date(2026, 6, 2, 7, 5)
    expect(formatLocalDate(date)).toBe('02/07/2026')
    expect(formatLocalTime(date)).toBe('07:05')
  })
})
