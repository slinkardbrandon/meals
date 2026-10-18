import type { History, Plan } from './plan-file'
import type { Method, Protein, Recipe } from './types'
import { weekDistance, weekStart } from './week'

export type { History }

/** FNV-1a 32-bit over the UTF-8 bytes of `s`. */
export const fnv1a = (s: string) => {
  let h = 0x811c9dc5
  for (const byte of new TextEncoder().encode(s)) h = Math.imul(h ^ byte, 0x01000193) >>> 0
  return h
}

/** Seeded PRNG returning floats in [0, 1). */
export const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) >>> 0
  let t = seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Rotation weight: 0 if planned 1 week away, 0.25 at 2 weeks, else 1. */
export const weight = (id: string, target: string, history: History) => {
  const distances = history.filter(h => h.dinners.includes(id)).map(h => weekDistance(h.week, target))
  const closest = Math.min(Infinity, ...distances)
  return closest <= 1 ? 0 : closest === 2 ? 0.25 : 1
}

const sharesProtein = (a: Protein | undefined, b: Protein | undefined) =>
  a !== undefined && a !== 'none' && a !== 'mixed' && a === b

/** Rotation weight, halved per picked dinner sharing protein and per one sharing method. */
export const score = (id: string, recipes: Record<string, Recipe>, target: string, history: History, picked: string[]) => {
  const recipe = recipes[id]!
  let w = weight(id, target, history)
  for (const other of picked.map(p => recipes[p]!)) {
    if (sharesProtein(recipe.protein, other.protein)) w *= 0.5
    if (recipe.method === other.method) w *= 0.5
  }
  return w
}

export type Filter = { method?: Method; protein?: Protein }

export type PickOptions = {
  recipes: Record<string, Recipe>
  target: string
  history: History
  count: number
  seed: string
  exclude?: string[]
  /** Already chosen: never re-picked, and counted for variety. */
  picked?: string[]
  filter?: Filter
}

/** Weighted sampling without replacement. Returns fewer than `count` only when the pool runs dry. */
export const pick = ({ recipes, target, history, count, seed, exclude = [], picked = [], filter = {} }: PickOptions) => {
  const rand = mulberry32(fnv1a(seed))
  const chosen = [...picked]
  let pool = Object.keys(recipes)
    .filter(id => !exclude.includes(id) && !picked.includes(id))
    .filter(id => (!filter.method || recipes[id]!.method === filter.method)
      && (!filter.protein || recipes[id]!.protein === filter.protein))
    .filter(id => weight(id, target, history) > 0)
    .sort()
  const picks: string[] = []

  while (picks.length < count && pool.length) {
    const weights = pool.map(id => score(id, recipes, target, history, chosen))
    let r = rand() * weights.reduce((a, b) => a + b, 0)
    let i = 0
    while (i < pool.length - 1 && (r -= weights[i]!) >= 0) i++
    const id = pool[i]!
    picks.push(id)
    chosen.push(id)
    pool = pool.filter(p => p !== id)
  }
  return { picks, shortfall: picks.length < count }
}

export type MakePlanOptions = {
  recipes: Record<string, Recipe>
  week: string
  history: History
  count: number
  seed?: string
  exclude?: string[]
}

export const makePlan = ({ recipes, week, history, count, seed = week, exclude = [] }: MakePlanOptions) => {
  const { picks, shortfall } = pick({ recipes, target: week, history, count, seed, exclude })
  const plan: Plan = { week, starts: weekStart(week), seed, dinners: picks, dropped: [...new Set(exclude)] }
  return { plan, shortfall }
}

export const drop = (plan: Plan, id: string): Plan => {
  if (!plan.dinners.includes(id)) throw new Error(`${id} is not in ${plan.week}'s dinners`)
  return { ...plan, dinners: plan.dinners.filter(d => d !== id), dropped: [...plan.dropped, id] }
}

export type AddOptions = Filter & {
  recipes: Record<string, Recipe>
  history: History
  /** A specific dinner. A dropped id is allowed and leaves `dropped`. */
  id?: string
}

export const add = (plan: Plan, { recipes, history, id, ...filter }: AddOptions) => {
  const seed = `${plan.seed}:add:${plan.dinners.length + plan.dropped.length}`
  if (id !== undefined) {
    if (plan.dinners.includes(id)) throw new Error(`${id} is already in ${plan.week}'s dinners`)
    if (weight(id, plan.week, history) === 0) throw new Error(`${id} is planned one week away from ${plan.week}`)
    const next = { ...plan, dinners: [...plan.dinners, id], dropped: plan.dropped.filter(d => d !== id) }
    return { plan: next, added: [id], seed, shortfall: false }
  }
  const { picks, shortfall } = pick({
    recipes, target: plan.week, history, count: 1, seed,
    exclude: plan.dropped, picked: plan.dinners, filter,
  })
  return { plan: { ...plan, dinners: [...plan.dinners, ...picks] }, added: picks, seed, shortfall }
}
