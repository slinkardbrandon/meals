import type { ingredients } from './ingredients'
import type { kids } from './kids'

export const AISLES = ['produce', 'meat', 'dairy', 'deli', 'bakery', 'pantry', 'frozen', 'spices'] as const
export type Aisle = typeof AISLES[number]

export const STORES = ['hyvee', 'target'] as const
export type Store = typeof STORES[number]

export const STORE_NAMES: Record<Store, string> = { hyvee: 'Hy-Vee', target: 'Target' }

/** Allowed stores per aisle unless an ingredient sets `stores`. First is the default. */
export const AISLE_STORES: Record<Aisle, readonly Store[]> = {
  produce: ['hyvee'],
  meat: ['hyvee'],
  deli: ['hyvee'],
  dairy: ['target', 'hyvee'],
  bakery: ['target', 'hyvee'],
  pantry: ['target', 'hyvee'],
  frozen: ['target', 'hyvee'],
  spices: [],
}

export type IngredientInfo = {
  aisle: Aisle
  /** Overrides `AISLE_STORES`. First is the default; one entry locks; `[]` never carts. */
  stores?: readonly Store[]
  aliases?: readonly string[]
  /** Always on hand; left off the grocery list unless asked. */
  staple?: boolean
}

export type IngredientName = keyof typeof ingredients

/** Fractions go in qty: 1/4 cup is `{ qty: 0.25, unit: 'cup' }`. Omit unit for counts. */
export const UNITS = [
  'tsp', 'tbsp', 'cup', 'oz', 'lb',
  'can', 'jar', 'bottle', 'pkg', 'bag', 'box',
  'slice', 'clove', 'pinch',
] as const
export type Unit = typeof UNITS[number]

export type RecipeIngredient = {
  item: IngredientName
  qty?: number
  unit?: Unit
  /** Flagged "(optional)" on the grocery list unless another dinner needs it. */
  optional?: boolean
  /** e.g. "diced", "divided" */
  note?: string
}

export type Protein = 'beef' | 'chicken' | 'turkey' | 'pork' | 'egg' | 'beans' | 'chickpea' | 'mixed' | 'none'
export type Method = 'stovetop' | 'oven' | 'crockpot' | 'instant-pot' | 'grill' | 'smoker' | 'air-fryer' | 'no-cook'

export type Recipe = {
  title: string
  description?: string
  kidFriendly: boolean
  protein?: Protein
  method: Method
  source?: string
  servings?: number
  ingredients: RecipeIngredient[]
  steps: string[]
  /** Our changes to the source recipe, and anything else worth remembering. */
  notes?: string[]
}

export type Kid = keyof typeof kids
export type Preference = 'likes' | 'tolerates'

export type LunchItem = {
  title: string
  category: 'main' | 'side' | 'snack' | 'drink'
  /** A kid missing from this map won't eat it. */
  kids: Partial<Record<Kid, Preference>>
  ingredients: RecipeIngredient[]
}
