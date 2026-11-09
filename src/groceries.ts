import { ingredients } from './ingredients'
import { AISLES, AISLE_STORES, STORES, UNITS, type Aisle, type IngredientInfo, type Recipe, type Store, type Unit } from './types'

export type AisleGroup = { aisle: Aisle; lines: string[] }
/** `store` is null for items with no allowed store. */
export type StoreGroup = { store: Store | null; aisles: AisleGroup[] }

export type GroceryItem = {
  item: string
  aisle: Aisle
  stores: readonly Store[]
  /** Same text as the grocery list line, without the leading "- ". */
  line: string
  optional: boolean
}

/** Allowed stores, in order: the ingredient's override, else its aisle default. */
export const storesFor = (info: IngredientInfo) => info.stores ?? AISLE_STORES[info.aisle]

/** Rounds to 2 decimals and drops trailing zeros. */
export const formatQty = (n: number) => String(Math.round(n * 100) / 100)

type Tally = { totals: Map<Unit | undefined, number>; notes: string[]; optional: boolean }

const unitRank = (unit: Unit | undefined) => (unit === undefined ? -1 : UNITS.indexOf(unit))

const formatLine = (item: string, { totals, notes, optional }: Tally) => {
  const parts = [...totals]
    .sort(([a], [b]) => unitRank(a) - unitRank(b))
    .map(([unit, qty]) => (unit ? `${formatQty(qty)} ${unit}` : formatQty(qty)))
  const flags = optional ? ['optional', ...notes] : notes
  const note = flags.length ? ` (${flags.join(', ')})` : ''
  return parts.length ? `${item}: ${parts.join(' + ')}${note}` : `${item}${note}`
}

/**
 * Merges ingredients across dinners into one entry per item, sorted by item.
 * Skips staples and items missing from the registry. Flags an item optional only
 * when every dinner marks it optional. Mixed units are listed side by side, never converted.
 */
export const mergeItems = (
  recipes: Record<string, Recipe>,
  registry: Record<string, IngredientInfo> = ingredients,
): GroceryItem[] => {
  const tallies = new Map<string, Tally>()
  for (const id of Object.keys(recipes).sort()) {
    for (const { item, qty, unit, note, optional } of recipes[id]!.ingredients) {
      if (!registry[item] || registry[item].staple) continue
      let tally = tallies.get(item)
      if (!tally) tallies.set(item, (tally = { totals: new Map(), notes: [], optional: true }))
      if (!optional) tally.optional = false
      if (qty !== undefined) tally.totals.set(unit, (tally.totals.get(unit) ?? 0) + qty)
      if (note && !tally.notes.includes(note)) tally.notes.push(note)
    }
  }
  return [...tallies.keys()].sort().map(item => {
    const info = registry[item]!
    const tally = tallies.get(item)!
    return { item, aisle: info.aisle, stores: storesFor(info), line: formatLine(item, tally), optional: tally.optional }
  })
}

/** Staples used across dinners, sorted and deduped. */
export const stapleItems = (
  recipes: Record<string, Recipe>,
  registry: Record<string, IngredientInfo> = ingredients,
): string[] =>
  [...new Set(Object.values(recipes).flatMap(r => r.ingredients.map(i => i.item)))]
    .filter(item => registry[item]?.staple)
    .sort()

/**
 * Grocery lines grouped by default store, then aisle. Items with no allowed
 * store group under `null`, after every store.
 */
export const mergeGroceries = (
  recipes: Record<string, Recipe>,
  registry: Record<string, IngredientInfo> = ingredients,
): StoreGroup[] => {
  const items = mergeItems(recipes, registry)
  return [...STORES, null].flatMap(store => {
    const aisles = AISLES.flatMap(aisle => {
      const lines = items
        .filter(i => i.aisle === aisle && (i.stores[0] ?? null) === store)
        .map(i => i.line)
      return lines.length ? [{ aisle, lines }] : []
    })
    return aisles.length ? [{ store, aisles }] : []
  })
}
