import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { run } from '../main'
import { loadDinners } from './dinners'
import type { GroceryItem } from './groceries'
import { parsePlan, serializePlan } from './plan-file'
import { STORES } from './types'

// Sunday 2026-10-18 is in 2026-W42, so the default target is 2026-W43.
const now = new Date(2026, 9, 18)
let root: string
const quiet = () => {}
const cli = (...argv: string[]) => run(argv, { root, now, out: quiet, err: quiet })
const file = (rel: string) => join(root, rel)
const read = (rel: string) => readFileSync(file(rel), 'utf8')

beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'meals-')) })
afterEach(() => rmSync(root, { recursive: true, force: true }))

describe('cli', () => {
  test('plan defaults to next week', async () => {
    expect(await cli('plan')).toBe(0)
    expect(parsePlan(read('plans/2026/W43.md')).dinners).toHaveLength(5)
  })

  test('plan on an existing file exits 1 without writing; --force overwrites', async () => {
    const path = 'plans/2026/W43.md'
    mkdirSync(dirname(file(path)), { recursive: true })
    writeFileSync(file(path), 'hand edited')
    expect(await cli('plan', '--week', '2026-W43')).toBe(1)
    expect(read(path)).toBe('hand edited')
    expect(await cli('plan', '--week', '2026-W43', '--force')).toBe(0)
    expect(read(path)).toStartWith('<!--\nweek: 2026-W43\n')
  })

  test('delete-and-rerun plan produces identical bytes', async () => {
    expect(await cli('plan', '--week', '2026-W43')).toBe(0)
    const first = read('plans/2026/W43.md')
    rmSync(file('plans/2026/W43.md'))
    expect(await cli('plan', '--week', '2026-W43')).toBe(0)
    expect(read('plans/2026/W43.md')).toBe(first)
  })

  test('plan honors --count and records --exclude in dropped', async () => {
    expect(await cli('plan', '--week', '2026-W43', '--count', '3', '--exclude', 'stroganoff')).toBe(0)
    const plan = parsePlan(read('plans/2026/W43.md'))
    expect(plan.dinners).toHaveLength(3)
    expect(plan.dinners).not.toContain('stroganoff')
    expect(plan.dropped).toEqual(['stroganoff'])
  })

  test('plan rejects unknown dinner ids', async () => {
    expect(await cli('plan', '--week', '2026-W43', '--exclude', 'strogonof')).toBe(1)
    expect(existsSync(file('plans/2026/W43.md'))).toBe(false)
  })

  test('plan excludes dinners from the adjacent week', async () => {
    expect(await cli('plan', '--week', '2026-W43')).toBe(0)
    expect(await cli('plan', '--week', '2026-W44')).toBe(0)
    const w43 = parsePlan(read('plans/2026/W43.md')).dinners
    const w44 = parsePlan(read('plans/2026/W44.md')).dinners
    expect(w44.filter(id => w43.includes(id))).toEqual([])
  })

  test('drop moves an id to dropped and regenerates the body', async () => {
    await cli('plan', '--week', '2026-W43')
    const [id] = parsePlan(read('plans/2026/W43.md')).dinners
    expect(await cli('drop', id!, '--week', '2026-W43')).toBe(0)
    const text = read('plans/2026/W43.md')
    const plan = parsePlan(text)
    expect(plan.dinners).not.toContain(id!)
    expect(plan.dropped).toEqual([id!])
    expect(text).not.toContain(`(../../dinners/${id}.ts)`)
  })

  test('drop of an id not in dinners exits 1 without writing', async () => {
    await cli('plan', '--week', '2026-W43')
    const before = read('plans/2026/W43.md')
    const missing = ['stroganoff', 'flautas'].find(id => !parsePlan(before).dinners.includes(id))!
    expect(await cli('drop', missing, '--week', '2026-W43')).toBe(1)
    expect(read('plans/2026/W43.md')).toBe(before)
  })

  test('add appends a dinner and groceries regenerates', async () => {
    await cli('plan', '--week', '2026-W43')
    expect(await cli('add', '--week', '2026-W43')).toBe(0)
    expect(parsePlan(read('plans/2026/W43.md')).dinners).toHaveLength(6)
    const before = read('plans/2026/W43.md')
    expect(await cli('groceries', '--week', '2026-W43')).toBe(0)
    expect(read('plans/2026/W43.md')).toBe(before)
  })

  test('add rejects unknown method and protein values', async () => {
    await cli('plan', '--week', '2026-W43')
    const before = read('plans/2026/W43.md')
    expect(await cli('add', '--week', '2026-W43', '--method', 'smoekr')).toBe(1)
    expect(await cli('add', '--week', '2026-W43', '--protein', 'tofu')).toBe(1)
    expect(read('plans/2026/W43.md')).toBe(before)
  })

  test('drop/add/groceries with no plan file exit 1', async () => {
    expect(await cli('drop', 'stroganoff', '--week', '2026-W43')).toBe(1)
    expect(await cli('add', '--week', '2026-W43')).toBe(1)
    expect(await cli('groceries', '--week', '2026-W43')).toBe(1)
    expect(existsSync(file('plans/2026/W43.md'))).toBe(false)
  })

  test('every command on a week before the current ISO week exits 1 without writing', async () => {
    expect(await cli('plan', '--week', '2026-W41')).toBe(1)
    expect(existsSync(file('plans/2026/W41.md'))).toBe(false)

    // Plan the current week, then move the clock forward so it becomes past.
    expect(await cli('plan', '--week', '2026-W42')).toBe(0)
    const before = read('plans/2026/W42.md')
    const later = (...argv: string[]) => run(argv, { root, now: new Date(2026, 9, 26), out: quiet, err: quiet })
    const [id] = parsePlan(before).dinners
    expect(await later('plan', '--week', '2026-W42', '--force')).toBe(1)
    expect(await later('drop', id!, '--week', '2026-W42')).toBe(1)
    expect(await later('add', '--week', '2026-W42')).toBe(1)
    expect(await later('groceries', '--week', '2026-W42')).toBe(1)
    expect(read('plans/2026/W42.md')).toBe(before)
  })

  test('groceries rewrites an old-format plan', async () => {
    const path = 'plans/2026/W43.md'
    const recipes = await loadDinners()
    const fresh = serializePlan({ week: '2026-W43', starts: '2026-10-19', seed: '2026-W43', dinners: ['stroganoff'], dropped: [] }, recipes)
    const prefix = fresh.slice(0, fresh.indexOf('## Groceries'))
    mkdirSync(dirname(file(path)), { recursive: true })
    writeFileSync(file(path), `${prefix}## Groceries\n\n### produce\n- mushrooms: 2 lb (sliced)\n`)
    expect(await cli('groceries', '--week', '2026-W43')).toBe(0)
    const text = read(path)
    expect(text.slice(0, text.indexOf('## Groceries'))).toBe(prefix)
    expect(text).toContain('### Hy-Vee')
    expect(text).not.toMatch(/^### produce$/m)
  })

  test('week prints next week by default and honors --offset', async () => {
    const lines: string[] = []
    const capture = (...argv: string[]) => run(argv, { root, now, out: s => lines.push(s), err: quiet })
    expect(await capture('week')).toBe(0)
    expect(await capture('week', '--offset', '0')).toBe(0)
    expect(await capture('week', '--offset', '2')).toBe(0)
    expect(lines).toEqual(['2026-W43', '2026-W42', '2026-W44'])
  })
})

describe('carts', () => {
  const run_ = '.carts/runs/2026-W43'
  const json = (rel: string) => JSON.parse(read(rel))
  const put = (rel: string, value: unknown) => {
    mkdirSync(dirname(file(rel)), { recursive: true })
    writeFileSync(file(rel), JSON.stringify(value, null, 2) + '\n')
  }
  const planWith = (dinners: string[]) => {
    const path = 'plans/2026/W43.md'
    mkdirSync(dirname(file(path)), { recursive: true })
    return loadDinners().then(recipes =>
      writeFileSync(file(path), serializePlan({ week: '2026-W43', starts: '2026-10-19', seed: '2026-W43', dinners, dropped: [] }, recipes)))
  }
  /** Quotes every 2+ store item in stock at both stores; Target is cheaper. */
  const quoteAll = () => {
    const { items } = json(`${run_}/items.json`) as { items: GroceryItem[] }
    for (const store of STORES) {
      put(`${run_}/quotes-${store}.json`, items.filter(i => i.stores.length > 1).map(i => ({
        item: i.item, store, inStock: true, product: `${store} ${i.item}`, productId: `${store}-${i.item}`, count: 1,
        total: store === 'target' ? 2 : 3,
      })))
    }
  }

  test('writes items.json with items and staples', async () => {
    await planWith(['stroganoff'])
    expect(await cli('carts', '--week', '2026-W43')).toBe(0)
    const saved = json(`${run_}/items.json`)
    expect(saved.week).toBe('2026-W43')
    expect(saved.items.map((i: GroceryItem) => i.item)).toContain('ground beef')
    expect(saved.staples).toEqual(['A1 sauce', 'all-purpose flour', 'black pepper', 'olive oil', 'salt'])
    expect(read(`${run_}/items.json`)).toEndWith('}\n')
  })

  test('no plan exits 1', async () => {
    expect(await cli('carts', '--week', '2026-W43')).toBe(1)
    expect(existsSync(file(run_))).toBe(false)
  })

  test('refuses after --decide when the plan changed, leaving the run dir untouched', async () => {
    await planWith(['stroganoff'])
    expect(await cli('carts', '--week', '2026-W43')).toBe(0)
    quoteAll()
    expect(await cli('carts', '--week', '2026-W43', '--decide')).toBe(0)
    const before = ['items.json', 'decision.json'].map(f => read(`${run_}/${f}`))
    await planWith(['stroganoff', 'flautas'])
    expect(await cli('carts', '--week', '2026-W43')).toBe(1)
    expect(['items.json', 'decision.json'].map(f => read(`${run_}/${f}`))).toEqual(before)
  })

  test('rerun with an unchanged plan keeps decision.json', async () => {
    await planWith(['stroganoff'])
    expect(await cli('carts', '--week', '2026-W43')).toBe(0)
    quoteAll()
    expect(await cli('carts', '--week', '2026-W43', '--decide')).toBe(0)
    expect(await cli('carts', '--week', '2026-W43')).toBe(0)
    expect(existsSync(file(`${run_}/decision.json`))).toBe(true)
  })

  test('--fresh removes the run dir, then writes a new items.json', async () => {
    await planWith(['stroganoff'])
    expect(await cli('carts', '--week', '2026-W43')).toBe(0)
    quoteAll()
    expect(await cli('carts', '--week', '2026-W43', '--decide')).toBe(0)
    await planWith(['flautas'])
    expect(await cli('carts', '--week', '2026-W43', '--fresh')).toBe(0)
    expect(readdirSync(file(run_))).toEqual(['items.json'])
    expect(json(`${run_}/items.json`).items.map((i: GroceryItem) => i.item)).not.toContain('mushrooms')
  })

  test('--decide writes decision.json from the quote files', async () => {
    await planWith(['stroganoff'])
    await cli('carts', '--week', '2026-W43')
    quoteAll()
    const lines: string[] = []
    expect(await run(['carts', '--week', '2026-W43', '--decide'], { root, now, out: s => lines.push(s), err: quiet })).toBe(0)
    const decision = json(`${run_}/decision.json`)
    expect(decision.week).toBe('2026-W43')
    expect(decision.carts.target.map((a: { item: string }) => a.item)).toContain('sour cream')
    expect(decision.carts.hyvee.map((a: { item: string }) => a.item)).toContain('ground beef')
    expect(lines).toEqual([
      `Hy-Vee: ${decision.carts.hyvee.length}`,
      `Target: ${decision.carts.target.length}`,
      'misses: 0',
      'not carted: 0',
    ])
  })

  test('--decide with a malformed quotes file exits 1 without writing', async () => {
    await planWith(['stroganoff'])
    await cli('carts', '--week', '2026-W43')
    quoteAll()
    put(`${run_}/quotes-target.json`, [{ item: 'sour cream', store: 'target', inStock: 'yes' }])
    expect(await cli('carts', '--week', '2026-W43', '--decide')).toBe(1)
    expect(existsSync(file(`${run_}/decision.json`))).toBe(false)
  })

  test('--decide with a missing quotes file exits 1', async () => {
    await planWith(['stroganoff'])
    await cli('carts', '--week', '2026-W43')
    quoteAll()
    rmSync(file(`${run_}/quotes-hyvee.json`))
    expect(await cli('carts', '--week', '2026-W43', '--decide')).toBe(1)
    expect(existsSync(file(`${run_}/decision.json`))).toBe(false)
  })

  test('--decide when items.json is for another week exits 1', async () => {
    await planWith(['stroganoff'])
    await cli('carts', '--week', '2026-W43')
    quoteAll()
    put(`${run_}/items.json`, { ...json(`${run_}/items.json`), week: '2026-W44' })
    expect(await cli('carts', '--week', '2026-W43', '--decide')).toBe(1)
    expect(existsSync(file(`${run_}/decision.json`))).toBe(false)
  })

  test('--report prints the report and writes report.md', async () => {
    await planWith(['stroganoff'])
    await cli('carts', '--week', '2026-W43')
    quoteAll()
    await cli('carts', '--week', '2026-W43', '--decide')
    const decision = json(`${run_}/decision.json`)
    for (const store of STORES) {
      put(`${run_}/results-${store}.json`, decision.carts[store].map((a: { item: string }) => ({
        item: a.item, store, status: 'carted', product: `P ${a.item}`, productId: a.item, count: 1,
      })))
    }
    const lines: string[] = []
    expect(await run(['carts', '--week', '2026-W43', '--report'], { root, now, out: s => lines.push(s), err: quiet })).toBe(0)
    const report = read(`${run_}/report.md`)
    expect(report).toStartWith('# Carts 2026-W43\n\n## Hy-Vee\n')
    expect(report).toContain('## Check you have these\n\n- A1 sauce\n')
    expect(lines).toEqual([report.trimEnd()])
  })

  test('--decide --report together exits 1', async () => {
    await planWith(['stroganoff'])
    await cli('carts', '--week', '2026-W43')
    expect(await cli('carts', '--week', '2026-W43', '--decide', '--report')).toBe(1)
  })

  test('refuses a past week', async () => {
    const later = (...argv: string[]) => run(argv, { root, now: new Date(2026, 10, 8), out: quiet, err: quiet })
    expect(await later('carts', '--week', '2026-W43')).toBe(1)
  })
})

