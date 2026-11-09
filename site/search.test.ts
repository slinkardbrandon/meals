import { expect, test } from 'bun:test'
import { createSearch } from './app/search'
import { loadSiteData } from './gen-data'

const search = createSearch(Object.values((await loadSiteData()).dinners))
const top3 = (query: string) => search(query).slice(0, 3).map(r => r.title)

test('"chilli" finds Costco Style Chili', () => {
  expect(top3('chilli')).toContain('Costco Style Chili')
})

test('"spag" finds Dual-Sauce Cheesy Spaghetti Bake', () => {
  expect(top3('spag')).toContain('Dual-Sauce Cheesy Spaghetti Bake')
})

test('empty query returns nothing', () => {
  expect(search('  ')).toEqual([])
})

test('returns at most 8 results', () => {
  expect(search('e').length).toBeLessThanOrEqual(8)
})
