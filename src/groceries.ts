import { ingredients } from './ingredients'
import { AISLES, UNITS, type Aisle, type IngredientInfo, type Recipe, type Unit } from './types'

export type AisleGroup = { aisle: Aisle; lines: string[] }

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
 * Merges ingredients across dinners into aisle-grouped grocery lines.
 * Skips staples. Flags an item optional only when every dinner marks it optional.
 * Mixed units are listed side by side, never converted.
 */
export const mergeGroceries = (
  recipes: Record<string, Recipe>,
  registry: Record<string, IngredientInfo> = ingredients,
): AisleGroup[] => {
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

  return AISLES.flatMap(aisle => {
    const items = [...tallies.keys()].filter(item => registry[item]?.aisle === aisle).sort()
    return items.length ? [{ aisle, lines: items.map(item => formatLine(item, tallies.get(item)!)) }] : []
  })
}
