import { describe, expect, test } from 'bun:test'
import { decide, renderReport, validateQuotes, validateResults, type Decision, type FillResult, type Quote } from './carts'
import type { GroceryItem } from './groceries'
import type { Store } from './types'

const item = (name: string, stores: readonly Store[], optional = false): GroceryItem =>
  ({ item: name, aisle: 'pantry', stores, line: `${name}: 1`, optional })

const inStock = (name: string, store: Store, total: number, count = 1): Quote =>
  ({ item: name, store, inStock: true, product: `${store} ${name}`, productId: `${store}-${name}`, count, total })

const out = (name: string, store: Store): Quote => ({ item: name, store, inStock: false })

const either = item('pasta', ['target', 'hyvee'])
const assigned = (quotes: Quote[], items: GroceryItem[] = [either]) => {
  const d = decide('2026-W46', items, quotes)
  return [...d.carts.hyvee, ...d.carts.target]
}

describe('decide', () => {
  test('locked item is assigned without a quote, even when another store is cheaper', () => {
    const beef = item('ground beef', ['hyvee'])
    const d = decide('2026-W46', [beef], [inStock('ground beef', 'target', 1)])
    expect(d.carts).toEqual({
      hyvee: [{ item: 'ground beef', line: 'ground beef: 1', optional: false, stores: ['hyvee'], store: 'hyvee', reason: 'default' }],
      target: [],
    })
    expect(d.misses).toEqual([])
  })

  test('stays at default when the alternative saves 10% and $0.50; quote is the default quote', () => {
    const [a] = assigned([inStock('pasta', 'target', 5), inStock('pasta', 'hyvee', 4.5)])
    expect(a).toMatchObject({ store: 'target', reason: 'default', quote: inStock('pasta', 'target', 5) })
    expect(a!.defaultTotal).toBeUndefined()
  })

  test('moves when the alternative saves 15% exactly', () => {
    const [a] = assigned([inStock('pasta', 'target', 10), inStock('pasta', 'hyvee', 8.5)])
    expect(a).toMatchObject({ store: 'hyvee', reason: 'cheaper', quote: inStock('pasta', 'hyvee', 8.5), defaultTotal: 10 })
  })

  test('moves when the alternative saves $1 exactly but under 15%', () => {
    const [a] = assigned([inStock('pasta', 'target', 20), inStock('pasta', 'hyvee', 19)])
    expect(a).toMatchObject({ store: 'hyvee', reason: 'cheaper', defaultTotal: 20 })
  })

  test('float totals compare in rounded cents', () => {
    // 0.1 + 0.2 style drift must not flip the 15% boundary.
    const [a] = assigned([inStock('pasta', 'target', 10.000000001), inStock('pasta', 'hyvee', 8.5000000001)])
    expect(a).toMatchObject({ store: 'hyvee', reason: 'cheaper' })
    const [b] = assigned([inStock('pasta', 'target', 0.1 + 0.2 + 9.7), inStock('pasta', 'hyvee', 8.5)])
    expect(b).toMatchObject({ store: 'hyvee', reason: 'cheaper' })
  })

  test('moves to the cheapest in-stock alternative when the default is out', () => {
    const [a] = assigned([out('pasta', 'target'), inStock('pasta', 'hyvee', 30)])
    expect(a).toMatchObject({ store: 'hyvee', reason: 'default-out', quote: inStock('pasta', 'hyvee', 30) })
    expect(a!.defaultTotal).toBeUndefined()
  })

  test('a missing quote counts as out of stock', () => {
    const [a] = assigned([inStock('pasta', 'hyvee', 3)])
    expect(a).toMatchObject({ store: 'hyvee', reason: 'default-out' })
  })

  test('miss when every allowed store is out', () => {
    const d = decide('2026-W46', [either], [out('pasta', 'target')])
    expect(d.carts).toEqual({ hyvee: [], target: [] })
    expect(d.misses).toEqual([{ item: 'pasta', line: 'pasta: 1', stores: ['target', 'hyvee'] }])
  })

  test('a stores: [] item is not carted, never a miss', () => {
    const spice = item('cumin', [])
    const d = decide('2026-W46', [spice], [])
    expect(d).toEqual({ week: '2026-W46', carts: { hyvee: [], target: [] }, misses: [], notCarted: [spice] })
  })

  test('ties go to the earlier store in stores', () => {
    const flipped = item('pasta', ['hyvee', 'target'])
    const [b] = assigned([inStock('pasta', 'target', 3), inStock('pasta', 'hyvee', 3)], [flipped])
    expect(b).toMatchObject({ store: 'hyvee', reason: 'default' })
    const [c] = assigned([inStock('pasta', 'target', 3), inStock('pasta', 'hyvee', 3)])
    expect(c).toMatchObject({ store: 'target', reason: 'default' })
  })

  test('assignments keep items order', () => {
    const items = [item('b', ['target', 'hyvee']), item('a', ['target', 'hyvee'])]
    const d = decide('2026-W46', items, [inStock('b', 'target', 1), inStock('a', 'target', 1)])
    expect(d.carts.target.map(a => a.item)).toEqual(['b', 'a'])
  })
})

describe('validateQuotes', () => {
  const items = [either, item('ground beef', ['hyvee']), item('rice', ['target', 'hyvee'])]
  const good = { item: 'pasta', store: 'target', inStock: true, product: 'P', productId: '1', count: 1, total: 2.5, extra: 'ignored' }
  const bad = (entry: object) => () => validateQuotes('target', items, [entry])

  test('accepts valid entries and drops extra keys', () => {
    expect(validateQuotes('target', items, [good, { item: 'rice', store: 'target', inStock: false }])).toEqual([
      { item: 'pasta', store: 'target', inStock: true, product: 'P', productId: '1', count: 1, total: 2.5 },
      { item: 'rice', store: 'target', inStock: false },
    ])
  })

  test('rejects malformed entries', () => {
    expect(() => validateQuotes('target', items, {})).toThrow('quotes-target.json')
    expect(bad({ ...good, store: 'hyvee' })).toThrow('quotes-target.json')
    expect(() => validateQuotes('target', items, [good, good])).toThrow('pasta')
    expect(bad({ ...good, item: 'unicorn' })).toThrow('unicorn')
    expect(bad({ ...good, item: 'ground beef' })).toThrow('ground beef')
    expect(() => validateQuotes('target', [item('x', ['target'])], [{ ...good, item: 'x' }])).toThrow('under 2')
    expect(() => validateQuotes('hyvee', [item('x', ['target', 'target'])], [{ ...good, store: 'hyvee', item: 'x' }])).toThrow('not allowed')
    expect(bad({ ...good, count: 0 })).toThrow()
    expect(bad({ ...good, count: 1.5 })).toThrow()
    expect(bad({ ...good, total: Infinity })).toThrow()
    expect(bad({ ...good, total: Number.NaN })).toThrow()
    expect(bad({ ...good, total: 0 })).toThrow()
    expect(bad({ ...good, productId: '' })).toThrow()
    expect(bad({ ...good, product: '' })).toThrow()
    expect(bad({ ...good, inStock: 'yes' })).toThrow()
    expect(bad({ item: 'pasta', store: 'target' })).toThrow()
  })
})

const decision: Decision = decide('2026-W46', [
  item('pasta', ['target', 'hyvee']),
  item('ground beef', ['hyvee']),
], [inStock('pasta', 'target', 2)])

describe('validateResults', () => {
  const good = { item: 'pasta', store: 'target', status: 'carted', product: 'P', productId: '1', count: 2, extra: 1 }
  const bad = (entry: object) => () => validateResults('target', decision, [entry])

  test('accepts valid entries and drops extra keys', () => {
    expect(validateResults('target', decision, [{ ...good, substitution: 'store brand' }])).toEqual([
      { item: 'pasta', store: 'target', status: 'carted', product: 'P', productId: '1', count: 2, substitution: 'store brand' },
    ])
    expect(validateResults('hyvee', decision, [{ item: 'ground beef', store: 'hyvee', status: 'not-found', note: 'n' }])).toEqual([
      { item: 'ground beef', store: 'hyvee', status: 'not-found', note: 'n' },
    ])
  })

  test('rejects malformed entries', () => {
    expect(() => validateResults('target', decision, 'nope')).toThrow('results-target.json')
    expect(bad({ ...good, store: 'hyvee' })).toThrow('results-target.json')
    expect(() => validateResults('target', decision, [good, good])).toThrow('pasta')
    expect(bad({ ...good, item: 'ground beef' })).toThrow('ground beef')
    expect(bad({ ...good, substitution: 3 })).toThrow()
    expect(bad({ ...good, substitution: '' })).toThrow()
    expect(bad({ ...good, status: 'maybe' })).toThrow()
    expect(bad({ ...good, count: -1 })).toThrow()
    expect(bad({ ...good, productId: '' })).toThrow()
  })
})

describe('renderReport', () => {
  const items: GroceryItem[] = [
    { item: 'Prego meat sauce', aisle: 'pantry', stores: ['target', 'hyvee'], line: 'Prego meat sauce: 2 jar', optional: false },
    { item: 'canned corn', aisle: 'pantry', stores: ['target', 'hyvee'], line: 'canned corn: 1 can (optional)', optional: true },
    { item: 'chicken breast', aisle: 'meat', stores: ['hyvee'], line: 'chicken breast: 2 lb', optional: false },
    { item: 'egg noodles', aisle: 'pantry', stores: ['target', 'hyvee'], line: 'egg noodles: 0.5 bag (6 oz)', optional: false },
    { item: 'ground beef', aisle: 'meat', stores: ['hyvee'], line: 'ground beef: 3 lb', optional: false },
    { item: 'mushrooms', aisle: 'produce', stores: ['hyvee'], line: 'mushrooms: 1 lb', optional: false },
    { item: 'salsa verde', aisle: 'pantry', stores: ['target', 'hyvee'], line: 'salsa verde: 1 jar', optional: false },
    { item: 'smoked chili flakes', aisle: 'spices', stores: [], line: 'smoked chili flakes: 1 tsp', optional: false },
    { item: 'sour cream', aisle: 'dairy', stores: ['target', 'hyvee'], line: 'sour cream (for a creamier texture)', optional: false },
  ]
  const fixture = decide('2026-W46', items, [
    inStock('Prego meat sauce', 'target', 5.98, 2),
    inStock('canned corn', 'target', 1),
    out('egg noodles', 'target'),
    inStock('egg noodles', 'hyvee', 2.49),
    inStock('sour cream', 'target', 2.89),
    inStock('sour cream', 'hyvee', 2.19),
  ])
  const results: FillResult[] = [
    { item: 'sour cream', store: 'hyvee', status: 'carted', product: 'Daisy Sour Cream 16 oz', productId: 's', count: 1 },
    { item: 'ground beef', store: 'hyvee', status: 'carted', product: '85/15 Ground Beef 1 lb', productId: 'g', count: 3 },
    { item: 'egg noodles', store: 'hyvee', status: 'carted', product: 'Hy-Vee Egg Noodles 12 oz', productId: 'e', count: 1, substitution: 'Hy-Vee brand instead of Reames' },
    { item: 'chicken breast', store: 'hyvee', status: 'out-of-stock', note: 'only bone-in' },
    { item: 'canned corn', store: 'target', status: 'carted', product: 'Good & Gather Corn 15 oz', productId: 'c', count: 1 },
    { item: 'Prego meat sauce', store: 'target', status: 'carted', product: 'Prego Meat Sauce 24 oz', productId: 'p', count: 2 },
  ]

  test('renders every section in order', () => {
    expect(renderReport(fixture, results, ['black pepper', 'cumin'])).toBe(`# Carts 2026-W46

## Hy-Vee

- egg noodles: 0.5 bag (6 oz) -> Hy-Vee Egg Noodles 12 oz x 1
- ground beef: 3 lb -> 85/15 Ground Beef 1 lb x 3
- sour cream (for a creamier texture) -> Daisy Sour Cream 16 oz x 1

## Target

- Prego meat sauce: 2 jar -> Prego Meat Sauce 24 oz x 2
- canned corn: 1 can (optional) -> Good & Gather Corn 15 oz x 1

## Moved stores

- egg noodles -> Hy-Vee: Target out of stock
- sour cream -> Hy-Vee: $2.19 vs $2.89 at Target

## Substitutions

- egg noodles (Hy-Vee): Hy-Vee brand instead of Reames

## Misses

- salsa verde (Target, Hy-Vee: out of stock everywhere)
- chicken breast (Hy-Vee: out-of-stock, only bone-in)
- mushrooms (Hy-Vee: no result)

## Optional, carted

- canned corn (Target)

## Not carted

- smoked chili flakes: 1 tsp

## Check you have these

- black pepper
- cumin
`)
  })

  test('omits empty sections', () => {
    const d = decide('2026-W46', [item('ground beef', ['hyvee'])], [])
    const r: FillResult[] = [{ item: 'ground beef', store: 'hyvee', status: 'carted', product: 'Beef', productId: 'b', count: 1 }]
    expect(renderReport(d, r, [])).toBe('# Carts 2026-W46\n\n## Hy-Vee\n\n- ground beef: 1 -> Beef x 1\n')
  })

  test('an assignment with no result renders as a no result miss', () => {
    const d = decide('2026-W46', [item('ground beef', ['hyvee'])], [])
    expect(renderReport(d, [], [])).toBe('# Carts 2026-W46\n\n## Misses\n\n- ground beef (Hy-Vee: no result)\n')
  })
})
