import { describe, expect, test } from 'bun:test'
import { ingredients } from './ingredients'
import { parsePlan, serializePlan, type Plan } from './plan-file'
import type { IngredientInfo, Recipe } from './types'

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

  test('renders hidden metadata, dinners, and groceries', () => {
    const plan: Plan = { week: '2026-W43', starts: '2026-10-19', seed: '2026-W43', dinners: ['stroganoff'], dropped: [] }
    expect(serializePlan(plan, recipes)).toBe(`<!--
week: 2026-W43
starts: 2026-10-19
seed: 2026-W43
dinners: [stroganoff]
dropped: []
-->

## Dinners

- [Stroganoff](../../dinners/stroganoff.ts)

## Groceries

### Hy-Vee

#### produce
- mushrooms: 1 lb (sliced)
`)
  })

  test('renders two stores with two aisles each', () => {
    const fixture: Record<string, Recipe> = {
      stroganoff: {
        title: 'Stroganoff',
        kidFriendly: false,
        method: 'stovetop',
        ingredients: [
          { item: 'mushrooms', qty: 1, unit: 'lb', note: 'sliced' },
          { item: 'ground beef', qty: 3, unit: 'lb' },
          { item: 'sour cream', qty: 1, unit: 'cup' },
          { item: 'Prego meat sauce', qty: 1, unit: 'jar' },
        ],
        steps: [],
      },
    }
    const plan: Plan = { week: '2026-W43', starts: '2026-10-19', seed: '2026-W43', dinners: ['stroganoff'], dropped: [] }
    const text = serializePlan(plan, fixture)
    expect(text.slice(text.indexOf('## Groceries'))).toBe(`## Groceries

### Hy-Vee

#### produce
- mushrooms: 1 lb (sliced)

#### meat
- ground beef: 3 lb

### Target

#### dairy
- sour cream: 1 cup

#### pantry
- Prego meat sauce: 1 jar
`)
  })

  test('renders stores: [] items under Any store, last', () => {
    const registry: Record<string, IngredientInfo> = { ...ingredients, pasta: { aisle: 'pantry', stores: [] } }
    const fixture: Record<string, Recipe> = {
      stroganoff: {
        title: 'Stroganoff',
        kidFriendly: false,
        method: 'stovetop',
        ingredients: [{ item: 'pasta', qty: 1, unit: 'box' }, { item: 'mushrooms', qty: 1, unit: 'lb' }],
        steps: [],
      },
    }
    const plan: Plan = { week: '2026-W43', starts: '2026-10-19', seed: '2026-W43', dinners: ['stroganoff'], dropped: [] }
    expect(serializePlan(plan, fixture, registry)).toEndWith(`## Groceries

### Hy-Vee

#### produce
- mushrooms: 1 lb

### Any store

#### pantry
- pasta: 1 box
`)
  })

  test('renders zero non-staple items as an empty section', () => {
    const plan: Plan = { week: '2026-W43', starts: '2026-10-19', seed: '2026-W43', dinners: [], dropped: [] }
    expect(serializePlan(plan, recipes)).toEndWith('## Groceries\n\n\n')
  })

  test('still reads legacy --- frontmatter', () => {
    const legacy = '---\nweek: 2026-W43\nstarts: 2026-10-19\nseed: 2026-W43\ndinners: [stroganoff]\ndropped: []\n---\n\n## Dinners\n'
    expect(parsePlan(legacy)).toEqual({ week: '2026-W43', starts: '2026-10-19', seed: '2026-W43', dinners: ['stroganoff'], dropped: [] })
  })

  test('rejects a file without a metadata block', () => {
    expect(() => parsePlan('## Dinners\n')).toThrow()
  })
})
