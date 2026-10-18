// Weekly dinner planner. See README.md for commands.
process.env.TZ = 'America/Chicago'

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parseArgs } from 'node:util'
import { loadDinners, repoRoot } from './src/dinners'
import { parsePlan, readHistory, serializePlan, type Plan } from './src/plan-file'
import { add, drop, makePlan, type Filter } from './src/planner'
import type { Method, Protein, Recipe } from './src/types'
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
}

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
      throw new Error('usage: bun main.ts <plan|drop|add|groceries|week> [--week YYYY-Www]')
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
