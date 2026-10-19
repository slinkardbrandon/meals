import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { run } from '../main'
import { parsePlan } from './plan-file'

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

  test('week prints next week by default and honors --offset', async () => {
    const lines: string[] = []
    const capture = (...argv: string[]) => run(argv, { root, now, out: s => lines.push(s), err: quiet })
    expect(await capture('week')).toBe(0)
    expect(await capture('week', '--offset', '0')).toBe(0)
    expect(await capture('week', '--offset', '2')).toBe(0)
    expect(lines).toEqual(['2026-W43', '2026-W42', '2026-W44'])
  })
})
