import { expect, test } from 'bun:test'
import { parseRoute } from './app/routes'

test.each([
  ['', { name: 'home' }],
  ['#/', { name: 'home' }],
  ['#/plans', { name: 'plans' }],
  ['#/plans/', { name: 'plans' }],
  ['#/plans/2026-W46', { name: 'plan', week: '2026-W46' }],
  ['#/recipes', { name: 'recipes' }],
  ['#/recipes/costco-style-chili', { name: 'recipe', id: 'costco-style-chili' }],
  ['#/nope', { name: 'notFound' }],
  ['#/recipes/a/b', { name: 'notFound' }],
] as const)('parseRoute(%p)', (hash, route) => {
  expect(parseRoute(hash)).toEqual(route)
})
