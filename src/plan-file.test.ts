import { describe, expect, test } from 'bun:test'
import { parsePlan, serializePlan, type Plan } from './plan-file'
import type { Recipe } from './types'

const recipes: Record<string, Recipe> = {
  stroganoff: {
    title: 'Stroganoff',
    kidFriendly: false,
    method: 'stovetop',
    ingredients: [{ item: 'mushrooms', qty: 1, unit: 'lb', note: 'sliced' }],
    steps: [],
  },
}

describe('plan file', () => {
  test('parse(serialize(plan)) round-trips, including empty dropped', () => {
    const plan: Plan = { week: '2026-W43', starts: '2026-10-19', seed: '2026-W43', dinners: ['stroganoff'], dropped: [] }
    expect(parsePlan(serializePlan(plan, recipes))).toEqual(plan)
    const withDropped = { ...plan, dropped: ['flautas', 'sloppy-joes'] }
    expect(parsePlan(serializePlan(withDropped, recipes))).toEqual(withDropped)
  })

  test('renders frontmatter, dinners, and groceries', () => {
    const plan: Plan = { week: '2026-W43', starts: '2026-10-19', seed: '2026-W43', dinners: ['stroganoff'], dropped: [] }
    expect(serializePlan(plan, recipes)).toBe(`---
week: 2026-W43
starts: 2026-10-19
seed: 2026-W43
dinners: [stroganoff]
dropped: []
---

## Dinners

- [Stroganoff](../../dinners/stroganoff.ts)

## Groceries

### produce
- mushrooms: 1 lb (sliced)
`)
  })

  test('rejects a file without frontmatter', () => {
    expect(() => parsePlan('## Dinners\n')).toThrow()
  })
})
