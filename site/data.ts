import { formatQty } from '../src/groceries'
import { parsePlan } from '../src/plan-file'
import type { Recipe, RecipeIngredient } from '../src/types'
import type { GroceryGroup, SiteData, SiteIngredient, SitePlan, SiteRecipe } from './app/types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 'Week of Nov 9' from '2026-11-09'. Splits the string; `new Date()` would shift a day in Central time. */
const weekLabel = (starts: string) => {
  const [, month, day] = starts.split('-').map(Number)
  return `Week of ${MONTHS[month! - 1]} ${day}`
}

const toIngredient = ({ item, qty, unit, note, optional }: RecipeIngredient): SiteIngredient => {
  const amount = qty === undefined ? [] : [formatQty(qty), ...(unit ? [unit] : [])]
  return {
    text: [...amount, item].join(' '),
    ...(note ? { note } : {}),
    optional: optional ?? false,
  }
}

const toRecipe = (id: string, r: Recipe): SiteRecipe => ({
  id,
  title: r.title,
  ...(r.description ? { description: r.description } : {}),
  kidFriendly: r.kidFriendly,
  ...(r.protein ? { protein: r.protein } : {}),
  method: r.method,
  ...(r.servings ? { servings: r.servings } : {}),
  ...(r.source ? { source: r.source } : {}),
  ingredients: r.ingredients.map(toIngredient),
  steps: r.steps,
  notes: r.notes ?? [],
})

/**
 * Groceries copied verbatim from the plan body. If the section has any `####`,
 * `###` is a store and `####` an aisle; otherwise `###` is an aisle (legacy, W43-W45).
 */
export const parseGroceries = (text: string): GroceryGroup[] => {
  const lines = text.split('\n')
  const start = lines.findIndex(l => l.trim() === '## Groceries')
  if (start < 0) return []
  const rest = lines.slice(start + 1)
  const end = rest.findIndex(l => l.startsWith('## '))
  const section = end < 0 ? rest : rest.slice(0, end)
  const storeLayout = section.some(l => l.startsWith('#### '))

  const groups: GroceryGroup[] = []
  const group = () => groups.at(-1) ?? (groups.push({ store: null, aisles: [] }), groups.at(-1)!)
  for (const line of section) {
    if (line.startsWith('#### ')) {
      group().aisles.push({ aisle: line.slice(5).trim(), lines: [] })
    } else if (line.startsWith('### ')) {
      const heading = line.slice(4).trim()
      if (storeLayout) groups.push({ store: heading, aisles: [] })
      else group().aisles.push({ aisle: heading, lines: [] })
    } else if (line.startsWith('- ')) {
      const aisles = group().aisles
      if (!aisles.length) aisles.push({ aisle: 'other', lines: [] })
      aisles.at(-1)!.lines.push(line.slice(2))
    }
  }
  return groups
}

const toPlan = (text: string, dinners: Record<string, Recipe>): SitePlan => {
  const { week, starts, dinners: ids } = parsePlan(text)
  for (const id of ids) {
    if (!dinners[id]) throw new Error(`Plan ${week} references unknown dinner "${id}"`)
  }
  return { week, starts, label: weekLabel(starts), dinners: ids, groceries: parseGroceries(text) }
}

/** Pure: recipes plus raw plan file texts in, site data out. */
export const buildSiteData = (input: { dinners: Record<string, Recipe>; planFiles: string[] }): SiteData => ({
  dinners: Object.fromEntries(Object.entries(input.dinners).map(([id, r]) => [id, toRecipe(id, r)])),
  // Week ids are zero-padded `YYYY-Www`, so string order is chronological.
  plans: input.planFiles.map(text => toPlan(text, input.dinners)).sort((a, b) => b.week.localeCompare(a.week)),
})
