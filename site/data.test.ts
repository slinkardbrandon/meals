import { describe, expect, test } from 'bun:test'
import type { Recipe } from '../src/types'
import { buildSiteData } from './data'
import { loadSiteData } from './gen-data'

const recipe = (title: string, extra: Partial<Recipe> = {}): Recipe => ({
  title,
  kidFriendly: true,
  method: 'stovetop',
  ingredients: [],
  steps: [],
  ...extra,
})

const dinners: Record<string, Recipe> = {
  'pizza-bagels': recipe('Pizza Bagels', { method: 'oven' }),
  'korean-beef-bowl': recipe('Korean Beef Bowl', { protein: 'beef' }),
  'chili': recipe('Chili'),
}

const planFile = (week: string, starts: string, ids: string[], body = '') =>
  [
    '<!--',
    `week: ${week}`,
    `starts: ${starts}`,
    `seed: ${week}`,
    `dinners: [${ids.join(', ')}]`,
    'dropped: []',
    '-->',
    '',
    body,
  ].join('\n')

const W46_BODY = `## Dinners

- [Korean Beef Bowl](../../dinners/korean-beef-bowl.ts)
- [Pizza Bagels](../../dinners/pizza-bagels.ts)

## Groceries

### Hy-Vee

#### produce
- carrot: 3 (chopped)
- minced garlic: 5 tsp + 2 tbsp

#### meat
- ground beef: 3 lb

### Target

#### dairy
- shredded mozzarella (for topping)

#### pantry
- Prego meat sauce: 2 jar
`

const W43_BODY = `## Dinners

- [Pizza Bagels](../../dinners/pizza-bagels.ts)

## Groceries

### produce
- yellow onion (cut into strips, not diced, diced, for topping)

### deli
- pepperoni
`

describe('buildSiteData', () => {
  test('sorts plans newest first across years', () => {
    const data = buildSiteData({
      dinners,
      planFiles: [
        planFile('2026-W52', '2026-12-21', ['chili']),
        planFile('2027-W01', '2026-12-28', ['chili']),
        planFile('2026-W46', '2026-11-09', ['chili']),
      ],
    })
    expect(data.plans.map(p => p.week)).toEqual(['2027-W01', '2026-W52', '2026-W46'])
  })

  test('parses store-grouped groceries verbatim', () => {
    const [plan] = buildSiteData({
      dinners,
      planFiles: [planFile('2026-W46', '2026-11-09', ['korean-beef-bowl', 'pizza-bagels'], W46_BODY)],
    }).plans
    expect(plan!.groceries).toEqual([
      {
        store: 'Hy-Vee',
        aisles: [
          { aisle: 'produce', lines: ['carrot: 3 (chopped)', 'minced garlic: 5 tsp + 2 tbsp'] },
          { aisle: 'meat', lines: ['ground beef: 3 lb'] },
        ],
      },
      {
        store: 'Target',
        aisles: [
          { aisle: 'dairy', lines: ['shredded mozzarella (for topping)'] },
          { aisle: 'pantry', lines: ['Prego meat sauce: 2 jar'] },
        ],
      },
    ])
  })

  test('parses legacy store-less groceries into one group', () => {
    const [plan] = buildSiteData({
      dinners,
      planFiles: [planFile('2026-W43', '2026-10-19', ['pizza-bagels'], W43_BODY)],
    }).plans
    expect(plan!.groceries).toEqual([
      {
        store: null,
        aisles: [
          { aisle: 'produce', lines: ['yellow onion (cut into strips, not diced, diced, for topping)'] },
          { aisle: 'deli', lines: ['pepperoni'] },
        ],
      },
    ])
  })

  test('takes dinner ids from metadata, not markdown links', () => {
    const [plan] = buildSiteData({
      dinners,
      // Body links list korean-beef-bowl and pizza-bagels; metadata says chili.
      planFiles: [planFile('2026-W46', '2026-11-09', ['chili'], W46_BODY)],
    }).plans
    expect(plan!.dinners).toEqual(['chili'])
  })

  test('builds the label from the starts date parts', () => {
    expect(process.env.TZ).toBe('America/Chicago')
    const [plan] = buildSiteData({ dinners, planFiles: [planFile('2026-W46', '2026-11-09', ['chili'])] }).plans
    expect(plan!.label).toBe('Week of Nov 9')
    expect(plan!.starts).toBe('2026-11-09')
  })

  test('throws when a plan references an unknown dinner', () => {
    expect(() => buildSiteData({ dinners, planFiles: [planFile('2026-W46', '2026-11-09', ['chili', 'foo'])] }))
      .toThrow('Plan 2026-W46 references unknown dinner "foo"')
  })

  test('throws on an invalid starts date', () => {
    expect(() => buildSiteData({ dinners, planFiles: [planFile('2026-W46', '2026-11', ['chili'])] }))
      .toThrow('Plan 2026-W46 has invalid starts "2026-11"')
  })

  test('includes every dinner keyed by id', () => {
    const data = buildSiteData({ dinners, planFiles: [] })
    expect(Object.keys(data.dinners).sort()).toEqual(['chili', 'korean-beef-bowl', 'pizza-bagels'])
    expect(data.dinners['pizza-bagels']).toMatchObject({ id: 'pizza-bagels', title: 'Pizza Bagels', method: 'oven' })
    expect(data.plans).toEqual([])
  })

  test('formats ingredients per the data contract', () => {
    const data = buildSiteData({
      dinners: {
        x: recipe('X', {
          ingredients: [
            { item: 'sour cream', qty: 0.25, unit: 'cup', note: 'for topping', optional: true },
            { item: 'yellow onion', qty: 1 },
            { item: 'salt', note: 'eyeball it' },
          ],
          steps: ['Cook.'],
          notes: ['Ours.'],
        }),
      },
      planFiles: [],
    })
    const x = data.dinners.x!
    expect(x.ingredients).toEqual([
      { text: '0.25 cup sour cream', note: 'for topping', optional: true },
      { text: '1 yellow onion', optional: false },
      { text: 'salt', note: 'eyeball it', optional: false },
    ])
    expect(x.steps).toEqual(['Cook.'])
    expect(x.notes).toEqual(['Ours.'])
    expect(data.dinners.chili).toBeUndefined()
  })

  test('defaults notes to an empty array', () => {
    expect(buildSiteData({ dinners, planFiles: [] }).dinners.chili!.notes).toEqual([])
  })
})

test('real repo data builds', async () => {
  const data = await loadSiteData()
  expect(Object.keys(data.dinners).length).toBeGreaterThan(0)
  expect(data.plans.length).toBeGreaterThan(0)
  const legacy = data.plans.find(p => p.week === '2026-W43')
  expect(legacy?.groceries[0]?.store).toBeNull()
})
