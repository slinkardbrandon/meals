// Cart decisions, validation, and the fill report. Pure; the CLI does the I/O.
import type { GroceryItem } from './groceries'
import { STORES, STORE_NAMES, type Store } from './types'

export type InStockQuote = { item: string; store: Store; inStock: true; product: string; productId: string; count: number; total: number }
export type Quote = InStockQuote | { item: string; store: Store; inStock: false }

export type Assignment = {
  item: string
  line: string
  optional: boolean
  /** The item's allowed stores; the first is its default. */
  stores: readonly Store[]
  store: Store
  reason: 'default' | 'cheaper' | 'default-out'
  /** The assigned store's quote. Present whenever one exists (every 2+ store item); absent for locked items. */
  quote?: InStockQuote
  /** Present when reason is 'cheaper': the default store's total. */
  defaultTotal?: number
}

/** Decide-time only: out at every allowed store. */
export type Miss = { item: string; line: string; stores: readonly Store[] }

export type Decision = {
  week: string
  carts: Record<Store, Assignment[]>
  misses: Miss[]
  notCarted: GroceryItem[]
}

/** `count` is the product's final cart quantity after top-up. */
export type FillResult =
  | { item: string; store: Store; status: 'carted'; product: string; productId: string; count: number; substitution?: string }
  | { item: string; store: Store; status: 'out-of-stock' | 'not-found'; note?: string }

const cents = (total: number) => Math.round(total * 100)

/** Move off the default when the line total saves at least 15% or at least $1. */
const worthMoving = (defaultTotal: number, altTotal: number) => {
  const savings = cents(defaultTotal) - cents(altTotal)
  return savings > 0 && (savings >= 100 || savings * 100 >= 15 * cents(defaultTotal))
}

/** Cheapest quote; ties keep the earlier one, so pass quotes in `stores` order. */
const cheapest = (quotes: InStockQuote[]) =>
  quotes.reduce<InStockQuote | undefined>((best, q) => (!best || cents(q.total) < cents(best.total) ? q : best), undefined)

export const decide = (week: string, items: GroceryItem[], quotes: Quote[]): Decision => {
  const carts = Object.fromEntries(STORES.map(s => [s, [] as Assignment[]])) as Record<Store, Assignment[]>
  const misses: Miss[] = []
  const notCarted: GroceryItem[] = []

  for (const grocery of items) {
    const { item, line, optional, stores } = grocery
    const base = { item, line, optional, stores }
    const [first, ...rest] = stores
    if (!first) {
      notCarted.push(grocery)
      continue
    }
    if (!rest.length) {
      carts[first].push({ ...base, store: first, reason: 'default' })
      continue
    }
    const quoteAt = (store: Store) =>
      quotes.find((q): q is InStockQuote => q.item === item && q.store === store && q.inStock)
    const home = quoteAt(first)
    const alt = cheapest(rest.flatMap(s => quoteAt(s) ?? []))
    if (home && alt && worthMoving(home.total, alt.total)) {
      carts[alt.store].push({ ...base, store: alt.store, reason: 'cheaper', quote: alt, defaultTotal: home.total })
    } else if (home) {
      carts[first].push({ ...base, store: first, reason: 'default', quote: home })
    } else if (alt) {
      carts[alt.store].push({ ...base, store: alt.store, reason: 'default-out', quote: alt })
    } else {
      misses.push({ item, line, stores })
    }
  }
  return { week, carts, misses, notCarted }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.length > 0
const positiveInt = (v: unknown): v is number => Number.isInteger(v) && (v as number) > 0

/** Shared entry checks: array shape, store match, unique items. Calls `check` per entry with a `fail` helper. */
const validateEntries = <T>(
  file: string,
  store: Store,
  value: unknown,
  check: (entry: Record<string, unknown>, item: string, fail: (msg: string) => never) => T,
): T[] => {
  if (!Array.isArray(value)) throw new Error(`${file}: expected an array`)
  const seen = new Set<string>()
  return value.map((entry, i) => {
    if (!isRecord(entry)) throw new Error(`${file}: entry ${i} is not an object`)
    const item = typeof entry.item === 'string' ? entry.item : `entry ${i}`
    const fail = (msg: string): never => { throw new Error(`${file}: ${item}: ${msg}`) }
    if (typeof entry.item !== 'string') fail('item must be a string')
    if (entry.store !== store) fail(`store must be "${store}"`)
    if (seen.has(item)) fail('duplicate item')
    seen.add(item)
    return check(entry, item, fail)
  })
}

export const validateQuotes = (store: Store, items: GroceryItem[], value: unknown): Quote[] =>
  validateEntries(`quotes-${store}.json`, store, value, (e, item, fail) => {
    const grocery = items.find(g => g.item === item) ?? fail('unknown item')
    if (grocery.stores.length < 2) fail('item has under 2 allowed stores; it is never quoted')
    if (!grocery.stores.includes(store)) fail(`${store} is not allowed for this item`)
    if (e.inStock === false) return { item, store, inStock: false }
    if (e.inStock !== true) fail('inStock must be true or false')
    if (!nonEmpty(e.product)) fail('product must be a non-empty string')
    if (!nonEmpty(e.productId)) fail('productId must be a non-empty string')
    if (!positiveInt(e.count)) fail('count must be a positive integer')
    if (typeof e.total !== 'number' || !Number.isFinite(e.total) || e.total <= 0) fail('total must be a finite number > 0')
    return { item, store, inStock: true, product: e.product as string, productId: e.productId as string, count: e.count as number, total: e.total as number }
  })

export const validateResults = (store: Store, decision: Decision, value: unknown): FillResult[] =>
  validateEntries(`results-${store}.json`, store, value, (e, item, fail): FillResult => {
    if (!decision.carts[store].some(a => a.item === item)) fail(`not assigned to ${store}`)
    if (e.status === 'out-of-stock' || e.status === 'not-found') {
      if (e.note !== undefined && typeof e.note !== 'string') fail('note must be a string')
      return { item, store, status: e.status, ...(e.note !== undefined && { note: e.note as string }) }
    }
    if (e.status !== 'carted') fail('status must be carted, out-of-stock, or not-found')
    if (!nonEmpty(e.product)) fail('product must be a non-empty string')
    if (!nonEmpty(e.productId)) fail('productId must be a non-empty string')
    if (!positiveInt(e.count)) fail('count must be a positive integer')
    if (e.substitution !== undefined && !nonEmpty(e.substitution)) fail('substitution must be a non-empty string')
    return {
      item, store, status: 'carted', product: e.product as string, productId: e.productId as string, count: e.count as number,
      ...(e.substitution !== undefined && { substitution: e.substitution as string }),
    }
  })

const byCodeUnit = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)
const byItem = <T extends { item: string }>(rows: T[]) => [...rows].sort((a, b) => byCodeUnit(a.item, b.item))
const byStoreThenItem = <T extends { item: string; store: Store }>(rows: T[]) =>
  [...rows].sort((a, b) => STORES.indexOf(a.store) - STORES.indexOf(b.store) || byCodeUnit(a.item, b.item))
const money = (n: number) => `$${(cents(n) / 100).toFixed(2)}`
const name = (s: Store) => STORE_NAMES[s]

export const renderReport = (decision: Decision, results: FillResult[], staples: string[]): string => {
  const assignments = STORES.flatMap(s => decision.carts[s])
  const assignmentOf = (r: { item: string; store: Store }) => decision.carts[r.store].find(a => a.item === r.item)!
  const carted = results.filter((r): r is Extract<FillResult, { status: 'carted' }> => r.status === 'carted')

  const fillMisses = byStoreThenItem([
    ...results.flatMap(r => (r.status === 'carted' ? [] : [{ item: r.item, store: r.store, text: r.note ? `${r.status}, ${r.note}` : r.status }])),
    ...STORES.flatMap(store => decision.carts[store]
      .filter(a => !results.some(r => r.store === store && r.item === a.item))
      .map(a => ({ item: a.item, store, text: 'no result' }))),
  ])

  const sections: [string, string[]][] = [
    ...STORES.map((s): [string, string[]] => [
      name(s),
      byItem(carted.filter(r => r.store === s)).map(r => `- ${assignmentOf(r).line} -> ${r.product} x ${r.count}`),
    ]),
    ['Moved stores', byItem(assignments.filter(a => a.reason !== 'default')).map(a =>
      a.reason === 'cheaper'
        ? `- ${a.item} -> ${name(a.store)}: ${money(a.quote!.total)} vs ${money(a.defaultTotal!)} at ${name(a.stores[0]!)}`
        : `- ${a.item} -> ${name(a.store)}: ${name(a.stores[0]!)} out of stock`)],
    ['Substitutions', byStoreThenItem(carted.filter(r => r.substitution)).map(r => `- ${r.item} (${name(r.store)}): ${r.substitution}`)],
    ['Misses', [
      ...byItem(decision.misses).map(m => `- ${m.item} (${m.stores.map(name).join(', ')}: out of stock everywhere)`),
      ...fillMisses.map(m => `- ${m.item} (${name(m.store)}: ${m.text})`),
    ]],
    ['Optional, carted', byStoreThenItem(carted.filter(r => assignmentOf(r).optional)).map(r => `- ${r.item} (${name(r.store)})`)],
    ['Not carted', byItem(decision.notCarted).map(i => `- ${i.line}`)],
    ['Check you have these', staples.map(s => `- ${s}`)],
  ]
  const body = sections.filter(([, rows]) => rows.length).map(([title, rows]) => [`## ${title}`, '', ...rows].join('\n'))
  return `${[`# Carts ${decision.week}`, ...body].join('\n\n')}\n`
}
