import { describe, expect, test } from 'bun:test'
import { formatQty, mergeGroceries } from './groceries'
import type { Recipe, RecipeIngredient } from './types'

const r = (...ingredients: RecipeIngredient[]): Recipe => ({
  title: 't',
  kidFriendly: false,
  method: 'stovetop',
  ingredients,
  steps: [],
})

const lines = (recipes: Record<string, Recipe>) => mergeGroceries(recipes).flatMap(g => g.lines)

describe('mergeGroceries', () => {
  test('sums qty for the same item and unit', () => {
    expect(lines({
      a: r({ item: 'ground beef', qty: 1, unit: 'lb' }),
      b: r({ item: 'ground beef', qty: 2, unit: 'lb' }),
    })).toEqual(['ground beef: 3 lb'])
  })

  test('one line per item; unitless count first, then Unit order', () => {
    expect(lines({
      a: r({ item: 'minced garlic', qty: 1, unit: 'tsp' }),
      b: r({ item: 'minced garlic', qty: 2, unit: 'clove' }, { item: 'minced garlic', qty: 1 }),
    })).toEqual(['minced garlic: 1 + 1 tsp + 2 clove'])
  })

  test('qty-less entries add nothing to qty, but their notes render', () => {
    expect(lines({
      a: r({ item: 'egg noodles', qty: 12, unit: 'oz' }),
      b: r({ item: 'egg noodles', note: 'for serving' }),
    })).toEqual(['egg noodles: 12 oz (for serving)'])
  })

  test('items with no qty anywhere render as the bare name', () => {
    expect(lines({ a: r({ item: 'egg noodles' }), b: r({ item: 'egg noodles' }) })).toEqual(['egg noodles'])
    expect(lines({ a: r({ item: 'egg noodles', note: 'for serving' }) })).toEqual(['egg noodles (for serving)'])
  })

  test('notes dedupe in first-seen-by-dinner-id order', () => {
    expect(lines({
      c: r({ item: 'yellow onion', note: 'diced' }),
      b: r({ item: 'yellow onion', qty: 0.5, note: 'cut into strips' }),
      a: r({ item: 'yellow onion', qty: 1, note: 'diced' }),
    })).toEqual(['yellow onion: 1.5 (diced, cut into strips)'])
  })

  test('rounds to 2 decimals and strips trailing zeros', () => {
    expect(formatQty(0.1 + 0.2)).toBe('0.3')
    expect(formatQty(2.67)).toBe('2.67')
    expect(formatQty(1 / 3)).toBe('0.33')
    expect(formatQty(2)).toBe('2')
    expect(lines({
      a: r({ item: 'heavy cream', qty: 0.1, unit: 'cup' }),
      b: r({ item: 'heavy cream', qty: 0.2, unit: 'cup' }),
    })).toEqual(['heavy cream: 0.3 cup'])
  })

  test('skips staples', () => {
    expect(lines({ a: r({ item: 'olive oil', qty: 1, unit: 'tbsp' }, { item: 'apple' }) })).toEqual(['apple'])
  })

  test('flags optional items instead of skipping them', () => {
    expect(lines({
      a: r({ item: 'apple', optional: true }, { item: 'heavy cream', qty: 1, unit: 'cup', optional: true, note: 'for topping' }),
    })).toEqual(['apple (optional)', 'heavy cream: 1 cup (optional, for topping)'])
  })

  test('an item required by any dinner is not flagged optional', () => {
    expect(lines({
      a: r({ item: 'sour cream', qty: 1, unit: 'cup' }),
      b: r({ item: 'sour cream', optional: true, note: 'for topping' }),
    })).toEqual(['sour cream: 1 cup (for topping)'])
  })

  test('groups by aisle in AISLES order, omits empty aisles, sorts items by code unit', () => {
    expect(mergeGroceries({
      a: r(
        { item: 'pasta', qty: 1, unit: 'box' },
        { item: 'sour cream', qty: 1, unit: 'cup' },
        { item: 'Prego meat sauce', qty: 1, unit: 'jar' },
        { item: 'mushrooms', qty: 1, unit: 'lb' },
      ),
    })).toEqual([
      { aisle: 'produce', lines: ['mushrooms: 1 lb'] },
      { aisle: 'dairy', lines: ['sour cream: 1 cup'] },
      { aisle: 'pantry', lines: ['Prego meat sauce: 1 jar', 'pasta: 1 box'] },
    ])
  })
})
