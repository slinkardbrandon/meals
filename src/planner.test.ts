import { describe, expect, test } from 'bun:test'
import type { Plan } from './plan-file'
import { add, drop, makePlan, pick, score, weight, type History } from './planner'
import type { Method, Protein, Recipe } from './types'

const r = (protein: Protein | undefined, method: Method): Recipe => ({
  title: `${protein ?? 'none'} ${method}`,
  kidFriendly: false,
  protein,
  method,
  ingredients: [],
  steps: [],
})

const recipes: Record<string, Recipe> = {
  a: r('beef', 'stovetop'),
  b: r('chicken', 'oven'),
  c: r('pork', 'crockpot'),
  d: r('turkey', 'grill'),
  e: r('beans', 'instant-pot'),
  f: r('egg', 'no-cook'),
  g: r('chickpea', 'crockpot'),
}

const target = '2026-W43'

describe('weight', () => {
  test('is 0 at distance 1, 0.25 at 2, 1 at 3+ and with no history', () => {
    expect(weight('a', target, [{ week: '2026-W42', dinners: ['a'] }])).toBe(0)
    expect(weight('a', target, [{ week: '2026-W41', dinners: ['a'] }])).toBe(0.25)
    expect(weight('a', target, [{ week: '2026-W40', dinners: ['a'] }])).toBe(1)
    expect(weight('a', target, [])).toBe(1)
  })

  test('uses the closest week, past or future', () => {
    const history: History = [
      { week: '2026-W41', dinners: ['a'] },
      { week: '2026-W44', dinners: ['a'] },
    ]
    expect(weight('a', target, history)).toBe(0)
  })

  test('treats a skipped week as elapsed time', () => {
    expect(weight('a', '2026-W42', [{ week: '2026-W40', dinners: ['a'] }])).toBe(0.25)
  })
})

describe('score', () => {
  test('halves per picked dinner sharing protein and per one sharing method', () => {
    const pool = { ...recipes, x: r('beef', 'oven'), y: r('beef', 'stovetop') }
    // a is beef/stovetop: x shares protein, y shares both
    expect(score('a', pool, target, [], ['x', 'y'])).toBe(0.125)
  })

  test('none, mixed, and undefined protein never halve', () => {
    for (const p of ['none', 'mixed', undefined] as const) {
      const pool = { m: r(p, 'oven'), n: r(p, 'grill') }
      expect(score('m', pool, target, [], ['n'])).toBe(1)
    }
  })

  test('stacks with rotation weight', () => {
    const pool = { a: r('beef', 'stovetop'), x: r('chicken', 'stovetop') }
    expect(score('a', pool, target, [{ week: '2026-W41', dinners: ['a'] }], ['x'])).toBe(0.125)
  })
})

describe('pick', () => {
  test('never picks a dinner planned at week distance 1, past or future', () => {
    const history: History = [
      { week: '2026-W42', dinners: ['a', 'b'] },
      { week: '2026-W44', dinners: ['c'] },
    ]
    for (let i = 0; i < 50; i++) {
      const { picks } = pick({ recipes, target, history, count: 4, seed: `s${i}` })
      expect(picks).toHaveLength(4)
      for (const id of ['a', 'b', 'c']) expect(picks).not.toContain(id)
    }
  })

  test('same seed and history yield identical picks regardless of input order', () => {
    const reversed = Object.fromEntries(Object.entries(recipes).reverse())
    const history: History = [{ week: '2026-W41', dinners: ['a'] }]
    const one = pick({ recipes, target, history, count: 5, seed: target })
    const two = pick({ recipes: reversed, target, history, count: 5, seed: target })
    expect(one.picks).toEqual(two.picks)
  })

  test('fills count even when every eligible dinner is beef/stovetop', () => {
    const beef = { p: r('beef', 'stovetop'), q: r('beef', 'stovetop'), s: r('beef', 'stovetop') }
    const result = pick({ recipes: beef, target, history: [], count: 3, seed: 'x' })
    expect(result.picks.toSorted()).toEqual(['p', 'q', 's'])
    expect(result.shortfall).toBe(false)
  })

  test('short pool returns fewer picks plus a shortfall flag', () => {
    const history: History = [{ week: '2026-W42', dinners: ['a', 'b', 'c', 'd'] }]
    const result = pick({ recipes, target, history, count: 5, seed: 'x' })
    expect(result.picks.toSorted()).toEqual(['e', 'f', 'g'])
    expect(result.shortfall).toBe(true)
  })
})

describe('makePlan', () => {
  test('first run with no history picks from all dinners', () => {
    const { plan, shortfall } = makePlan({ recipes, week: target, history: [], count: 7 })
    expect(plan.dinners.toSorted()).toEqual(Object.keys(recipes).toSorted())
    expect(shortfall).toBe(false)
  })

  test('seed defaults to the week id', () => {
    const { plan } = makePlan({ recipes, week: target, history: [], count: 5 })
    expect(plan).toMatchObject({ week: target, starts: '2026-10-19', seed: target })
    expect(plan.dinners).toEqual(pick({ recipes, target, history: [], count: 5, seed: target }).picks)
  })

  test('--exclude removes that dinner and records it in dropped', () => {
    const { plan, shortfall } = makePlan({ recipes, week: target, history: [], count: 7, exclude: ['c'] })
    expect(plan.dinners).not.toContain('c')
    expect(plan.dinners).toHaveLength(6)
    expect(plan.dropped).toEqual(['c'])
    expect(shortfall).toBe(true)
  })
})

describe('drop and add', () => {
  const base: Plan = { week: target, starts: '2026-10-19', seed: target, dinners: ['a', 'b', 'c'], dropped: ['d'] }

  test('drop moves an id from dinners to dropped', () => {
    expect(drop(base, 'b')).toMatchObject({ dinners: ['a', 'c'], dropped: ['d', 'b'] })
  })

  test('drop of an id not in dinners throws', () => {
    expect(() => drop(base, 'e')).toThrow()
  })

  test('random add never returns an id in dropped or already in dinners', () => {
    for (let i = 0; i < 30; i++) {
      const plan = { ...base, seed: `s${i}` }
      const { added } = add(plan, { recipes, history: [] })
      expect(added).toHaveLength(1)
      expect(['a', 'b', 'c', 'd']).not.toContain(added[0]!)
    }
  })

  test('add --id of a dropped id re-adds it and removes it from dropped', () => {
    const { plan } = add(base, { recipes, history: [], id: 'd' })
    expect(plan.dinners).toEqual(['a', 'b', 'c', 'd'])
    expect(plan.dropped).toEqual([])
  })

  test('add --id rejects distance-1 and already-planned ids', () => {
    expect(() => add(base, { recipes, history: [{ week: '2026-W42', dinners: ['e'] }], id: 'e' })).toThrow()
    expect(() => add(base, { recipes, history: [], id: 'a' })).toThrow()
  })

  test('add --method crockpot returns only crockpot dinners', () => {
    for (let i = 0; i < 20; i++) {
      const { added, shortfall } = add({ ...base, seed: `s${i}` }, { recipes, history: [], method: 'crockpot' })
      expect(['c', 'g']).toContain(added[0]!)
      expect(added[0]).not.toBe('c')
      expect(shortfall).toBe(false)
    }
  })

  test('add with no match returns none plus a shortfall flag', () => {
    const { plan, added, shortfall } = add(base, { recipes, history: [], method: 'smoker' })
    expect(added).toEqual([])
    expect(shortfall).toBe(true)
    expect(plan).toEqual(base)
  })

  test('drop X then add, repeated twice, never yields X and uses distinct seeds', () => {
    let plan: Plan = { ...base, dropped: [] }
    const seeds: string[] = []
    for (let i = 0; i < 2; i++) {
      const x = plan.dinners[0]!
      plan = drop(plan, x)
      const result = add(plan, { recipes, history: [] })
      expect(result.added).toHaveLength(1)
      expect(result.added[0]).not.toBe(x)
      seeds.push(result.seed)
      plan = result.plan
    }
    expect(new Set(seeds).size).toBe(2)
  })
})
