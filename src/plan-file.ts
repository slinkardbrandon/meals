import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mergeGroceries } from './groceries'
import type { Recipe } from './types'
import { addWeeks, planPath } from './week'

export type Plan = {
  week: string
  starts: string
  seed: string
  dinners: string[]
  dropped: string[]
}

export type History = { week: string; dinners: string[] }[]

const list = (key: string, value: string | undefined) => {
  const match = /^\[(.*)\]$/.exec(value ?? '')
  if (!match) throw new Error(`Plan metadata "${key}" must be a [list]`)
  return match[1]!.split(',').map(s => s.trim()).filter(Boolean)
}

/**
 * Parses the metadata block. The body is generated, so it's ignored.
 * Metadata lives in an HTML comment so GitHub hides it; `---` frontmatter is still read.
 */
export const parsePlan = (text: string): Plan => {
  const match = /^(?:<!--\n([\s\S]*?)\n-->|---\n([\s\S]*?)\n---)\n/.exec(text)
  if (!match) throw new Error('Plan file has no metadata block')
  const fields = new Map<string, string>()
  for (const line of (match[1] ?? match[2])!.split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) fields.set(line.slice(0, i).trim(), line.slice(i + 1).trim())
  }
  const scalar = (key: string) => {
    const value = fields.get(key)
    if (!value) throw new Error(`Plan metadata is missing "${key}"`)
    return value
  }
  return {
    week: scalar('week'),
    starts: scalar('starts'),
    seed: scalar('seed'),
    dinners: list('dinners', fields.get('dinners')),
    dropped: list('dropped', fields.get('dropped')),
  }
}

export const serializePlan = (plan: Plan, recipes: Record<string, Recipe>) => {
  const picked = Object.fromEntries(plan.dinners.map(id => [id, recipes[id]!]))
  const groceries = mergeGroceries(picked).map(({ aisle, lines }) =>
    [`### ${aisle}`, ...lines.map(line => `- ${line}`)].join('\n'))
  return [
    '<!--',
    `week: ${plan.week}`,
    `starts: ${plan.starts}`,
    `seed: ${plan.seed}`,
    `dinners: [${plan.dinners.join(', ')}]`,
    `dropped: [${plan.dropped.join(', ')}]`,
    '-->',
    '',
    '## Dinners',
    '',
    ...plan.dinners.map(id => `- [${recipes[id]!.title}](../../dinners/${id}.ts)`),
    '',
    '## Groceries',
    '',
    groceries.join('\n\n'),
    '',
  ].join('\n')
}

/** Dinners from every plan within 2 weeks of `target`, before or after. */
export const readHistory = (target: string, root: string): History =>
  [-2, -1, 1, 2].flatMap(offset => {
    const week = addWeeks(target, offset)
    const path = join(root, planPath(week))
    return existsSync(path) ? [{ week, dinners: parsePlan(readFileSync(path, 'utf8')).dinners }] : []
  })
