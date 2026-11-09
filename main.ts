// Weekly dinner planner. See README.md for commands.
process.env.TZ = 'America/Chicago'

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { isDeepStrictEqual } from 'node:util'
import { dirname, join } from 'node:path'
import { parseArgs } from 'node:util'
import { decide, renderReport, validateQuotes, validateResults, type Decision } from './src/carts'
import { loadDinners, repoRoot } from './src/dinners'
import { mergeItems, stapleItems, type GroceryItem } from './src/groceries'
import { parsePlan, readHistory, serializePlan, type Plan } from './src/plan-file'
import { add, drop, makePlan, type Filter } from './src/planner'
import { STORES, STORE_NAMES, type Method, type Protein, type Recipe } from './src/types'
import { addWeeks, weekDiff, weekId, planPath } from './src/week'

export type Context = {
  /** Where `plans/` lives. */
  root: string
  now: Date
  out: (line: string) => void
  err: (line: string) => void
}

const levenshtein = (a: string, b: string) => {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j]! + 1, row[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = row
  }
  return prev[b.length]!
}

const assertKnown = (id: string, recipes: Record<string, Recipe>) => {
  if (recipes[id]) return
  const ids = Object.keys(recipes)
  const substring = ids.filter(d => d.includes(id) || id.includes(d))
  const close = substring.length ? substring : ids.filter(d => levenshtein(d, id) <= 2)
  throw new Error(`Unknown dinner "${id}".${close.length ? ` Did you mean: ${close.join(', ')}?` : ''}`)
}

const commands = {
  async plan(week: string, values: Values, ctx: Context) {
    const path = join(ctx.root, planPath(week))
    if (existsSync(path) && !values.force) throw new Error(`${planPath(week)} exists; pass --force to overwrite`)
    const recipes = await loadDinners()
    const exclude = values.exclude ?? []
    for (const id of exclude) assertKnown(id, recipes)
    const count = values.count === undefined ? 5 : Number(values.count)
    if (!Number.isInteger(count) || count < 1) throw new Error(`--count must be a positive integer`)
    const { plan, shortfall } = makePlan({
      recipes, week, history: readHistory(week, ctx.root), count, seed: values.seed, exclude,
    })
    if (shortfall) ctx.err(`warning: only ${plan.dinners.length} of ${count} dinners are eligible for ${week}`)
    write(path, plan, recipes)
    ctx.out(plan.dinners.join('\n'))
  },

  async drop(week: string, values: Values, ctx: Context, [id]: string[]) {
    if (!id) throw new Error('usage: drop <id> [--week YYYY-Www]')
    const { path, plan } = readPlan(week, ctx)
    const recipes = await loadDinners()
    assertKnown(id, recipes)
    const next = drop(plan, id)
    write(path, next, recipes)
    ctx.out(next.dinners.join('\n'))
  },

  async add(week: string, values: Values, ctx: Context) {
    const { path, plan } = readPlan(week, ctx)
    const recipes = await loadDinners()
    if (values.id !== undefined) assertKnown(values.id, recipes)
    const all = Object.values(recipes)
    if (values.method && !all.some(r => r.method === values.method)) throw new Error(`No dinner uses method "${values.method}"`)
    if (values.protein && !all.some(r => r.protein === values.protein)) throw new Error(`No dinner has protein "${values.protein}"`)
    // Checked against real recipes above.
    const filter: Filter = { method: values.method as Method | undefined, protein: values.protein as Protein | undefined }
    const result = add(plan, { recipes, history: readHistory(week, ctx.root), id: values.id, ...filter })
    if (result.shortfall) ctx.err(`warning: no eligible dinner matches for ${week}`)
    write(path, result.plan, recipes)
    ctx.out(result.plan.dinners.join('\n'))
  },

  async groceries(week: string, _values: Values, ctx: Context) {
    const { path, plan } = readPlan(week, ctx)
    const recipes = await loadDinners()
    for (const id of plan.dinners) assertKnown(id, recipes)
    write(path, plan, recipes)
  },

  async carts(week: string, values: Values, ctx: Context) {
    const modes = (['fresh', 'decide', 'report'] as const).filter(m => values[m])
    if (modes.length > 1) throw new Error(`pass at most one of --${modes.join(', --')}`)
    const dir = join('.carts', 'runs', week)
    const at = (name: string) => join(dir, name)
    const readJson = <T>(name: string): T => {
      const rel = at(name)
      if (!existsSync(join(ctx.root, rel))) throw new Error(`missing ${rel}`)
      try {
        return JSON.parse(readFileSync(join(ctx.root, rel), 'utf8'))
      } catch (e) {
        throw new Error(`${rel}: ${(e as Error).message}`)
      }
    }
    const readWeek = <T extends { week: string }>(name: string) => {
      const value = readJson<T>(name)
      if (value.week !== week) throw new Error(`${at(name)} is for ${value.week}, not ${week}`)
      return value
    }
    const writeJson = (name: string, value: unknown) => writeFileSync(join(ctx.root, at(name)), JSON.stringify(value, null, 2) + '\n')

    if (values.decide) {
      const { items } = readWeek<ItemsFile>('items.json')
      const quotes = STORES.flatMap(store => validateQuotes(store, items, readJson(`quotes-${store}.json`)))
      const decision = decide(week, items, quotes)
      writeJson('decision.json', decision)
      for (const store of STORES) ctx.out(`${STORE_NAMES[store]}: ${decision.carts[store].length}`)
      ctx.out(`misses: ${decision.misses.length}`)
      ctx.out(`not carted: ${decision.notCarted.length}`)
      return
    }

    if (values.report) {
      const { staples } = readWeek<ItemsFile>('items.json')
      const decision = readWeek<Decision>('decision.json')
      const results = STORES.flatMap(store => validateResults(store, decision, readJson(`results-${store}.json`)))
      const report = renderReport(decision, results, staples)
      writeFileSync(join(ctx.root, at('report.md')), report)
      ctx.out(report.trimEnd())
      return
    }

    const { plan } = readPlan(week, ctx)
    const recipes = await loadDinners()
    for (const id of plan.dinners) assertKnown(id, recipes)
    const picked = Object.fromEntries(plan.dinners.map(id => [id, recipes[id]!]))
    const next: ItemsFile = { week, items: mergeItems(picked), staples: stapleItems(picked) }
    if (values.fresh) {
      // The week guard already validated `week`, so this stays inside .carts/runs/.
      rmSync(join(ctx.root, dir), { recursive: true, force: true })
    } else if (existsSync(join(ctx.root, at('decision.json')))) {
      const saved = existsSync(join(ctx.root, at('items.json'))) ? readJson<ItemsFile>('items.json').items : undefined
      // Round-trip through JSON so optional fields compare the way they were saved.
      if (!isDeepStrictEqual(JSON.parse(JSON.stringify(next.items)), saved)) {
        throw new Error('plan changed since decide; rerun with --fresh')
      }
    }
    mkdirSync(join(ctx.root, dir), { recursive: true })
    writeJson('items.json', next)
    ctx.out(at('items.json'))
  },
}

type ItemsFile = { week: string; items: GroceryItem[]; staples: string[] }

const options = {
  week: { type: 'string' },
  count: { type: 'string' },
  seed: { type: 'string' },
  exclude: { type: 'string', multiple: true },
  force: { type: 'boolean' },
  method: { type: 'string' },
  protein: { type: 'string' },
  id: { type: 'string' },
  offset: { type: 'string' },
  fresh: { type: 'boolean' },
  decide: { type: 'boolean' },
  report: { type: 'boolean' },
} as const

type Values = ReturnType<typeof parseArgs<{ options: typeof options; allowPositionals: true }>>['values']

const readPlan = (week: string, ctx: Context) => {
  const path = join(ctx.root, planPath(week))
  if (!existsSync(path)) throw new Error(`No plan for ${week}; run plan first`)
  return { path, plan: parsePlan(readFileSync(path, 'utf8')) }
}

const write = (path: string, plan: Plan, recipes: Record<string, Recipe>) => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, serializePlan(plan, recipes))
}

export const run = async (argv: string[], ctx: Context): Promise<number> => {
  try {
    const { values, positionals } = parseArgs({ args: argv, options, allowPositionals: true })
    const [command, ...rest] = positionals
    const current = weekId(ctx.now)

    if (command === 'week') {
      const offset = values.offset === undefined ? 1 : Number(values.offset)
      if (!Number.isInteger(offset)) throw new Error('--offset must be an integer')
      ctx.out(addWeeks(current, offset))
      return 0
    }
    if (!command || !(command in commands)) {
      throw new Error('usage: bun main.ts <plan|drop|add|groceries|carts|week> [--week YYYY-Www]')
    }

    const week = values.week ?? addWeeks(current, 1)
    if (weekDiff(current, week) < 0) throw new Error(`${week} is before the current week (${current}); past plans are history`)
    await commands[command as keyof typeof commands](week, values, ctx, rest)
    return 0
  } catch (e) {
    // Every refusal exits 1 without writing; writes happen last.
    ctx.err(`error: ${(e as Error).message}`)
    return 1
  }
}

if (import.meta.main) {
  process.exitCode = await run(process.argv.slice(2), {
    root: repoRoot,
    now: new Date(),
    out: line => console.log(line),
    err: line => console.error(line),
  })
}
