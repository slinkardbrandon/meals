import type { ingredients } from './ingredients'
import type { kids } from './kids'

export type Aisle = 'produce' | 'meat' | 'dairy' | 'deli' | 'bakery' | 'pantry' | 'frozen' | 'spices'

export type IngredientInfo = {
  aisle: Aisle
  aliases?: readonly string[]
  /** Always on hand; left off the grocery list unless asked. */
  staple?: boolean
}

export type IngredientName = keyof typeof ingredients

/** Fractions go in qty: 1/4 cup is `{ qty: 0.25, unit: 'cup' }`. Omit unit for counts. */
export type Unit =
  | 'tsp' | 'tbsp' | 'cup' | 'oz' | 'lb'
  | 'can' | 'jar' | 'bottle' | 'pkg' | 'bag' | 'box'
  | 'slice' | 'clove' | 'pinch'

export type RecipeIngredient = {
  item: IngredientName
  qty?: number
  unit?: Unit
  /** e.g. "diced", "divided" */
  note?: string
}

export type Protein = 'beef' | 'chicken' | 'turkey' | 'pork' | 'egg' | 'beans' | 'chickpea' | 'mixed' | 'none'
export type Method = 'stovetop' | 'oven' | 'crockpot' | 'instant-pot' | 'grill' | 'smoker' | 'no-cook'

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
