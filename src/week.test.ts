import { describe, expect, test } from 'bun:test'
import { addWeeks, planPath, weekDistance, weekId, weekStart } from './week'

describe('week', () => {
  test('computes week distance across ISO year boundaries', () => {
    expect(weekDistance('2026-W53', '2027-W01')).toBe(1)
    expect(weekDistance('2027-W01', '2026-W53')).toBe(1)
    expect(weekDistance('2026-W40', '2026-W42')).toBe(2)
  })

  test('maps dates to ISO week-year plan paths', () => {
    expect(planPath(weekId(new Date(2026, 11, 28)))).toBe('plans/2026/W53.md')
    expect(planPath(weekId(new Date(2025, 11, 29)))).toBe('plans/2026/W01.md')
  })

  test('weekStart is the Monday', () => {
    expect(weekStart('2026-W43')).toBe('2026-10-19')
  })

  test('addWeeks crosses year boundaries', () => {
    expect(addWeeks('2026-W53', 1)).toBe('2027-W01')
    expect(addWeeks('2026-W01', -1)).toBe('2025-W52')
  })

  test('rejects malformed and nonexistent weeks', () => {
    expect(() => weekStart('2026-43')).toThrow()
    expect(() => weekStart('2027-W53')).toThrow()
  })
})
