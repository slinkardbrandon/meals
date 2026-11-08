import { ingredients } from './ingredients'
import { AISLES, AISLE_STORE, STORES, UNITS, type Aisle, type IngredientInfo, type Recipe, type Store, type Unit } from './types'

export type AisleGroup = { aisle: Aisle; lines: string[] }
export type StoreGroup = { store: Store; aisles: AisleGroup[] }

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
 * Merges ingredients across dinners into grocery lines grouped by store, then aisle.
 * Skips staples. Flags an item optional only when every dinner marks it optional.
 * Mixed units are listed side by side, never converted.
 */
export const mergeGroceries = (
  recipes: Record<string, Recipe>,
  registry: Record<string, IngredientInfo> = ingredients,
): StoreGroup[] => {
  const tallies = new Map<string, Tally>()
  for (const id of Object.keys(recipes).sort()) {
    for (const { item, qty, unit, note, optional } of recipes[id]!.ingredients) {
      if (registry[item]?.staple) continue
      let tally = tallies.get(item)
      if (!tally) tallies.set(item, (tally = { totals: new Map(), notes: [], optional: true }))
      if (!optional) tally.optional = false
      if (qty !== undefined) tally.totals.set(unit, (tally.totals.get(unit) ?? 0) + qty)
      if (note && !tally.notes.includes(note)) tally.notes.push(note)
    }
  }

  const storeOf = (item: string) => {
    const info = registry[item]
    return info && (info.store ?? AISLE_STORE[info.aisle])
  }
  return STORES.flatMap(store => {
    const aisles = AISLES.flatMap(aisle => {
      const items = [...tallies.keys()]
        .filter(item => registry[item]?.aisle === aisle && storeOf(item) === store)
        .sort()
      return items.length ? [{ aisle, lines: items.map(item => formatLine(item, tallies.get(item)!)) }] : []
    })
    return aisles.length ? [{ store, aisles }] : []
  })
}
