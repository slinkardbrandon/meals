import { join } from 'node:path'
import type { Recipe } from './types'

export const repoRoot = join(import.meta.dir, '..')

/** Every dinner keyed by id (filename without `.ts`). */
export const loadDinners = async (): Promise<Record<string, Recipe>> => {
  const files = await Array.fromAsync(new Bun.Glob('dinners/*.ts').scan({ cwd: repoRoot }))
  const entries = await Promise.all(files.sort().map(async file => {
    const mod: { default: Recipe } = await import(join(repoRoot, file))
    return [file.slice('dinners/'.length, -'.ts'.length), mod.default] as const
  }))
  return Object.fromEntries(entries)
}
