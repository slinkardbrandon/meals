import type { IngredientInfo } from './types'

// Canonical names: generic, lowercase, singular. Brands only when they matter to us.
export const ingredients = {
  'ground beef': { aisle: 'meat', aliases: ['hamburger', 'ground chuck'] },
  'thin spaghetti': { aisle: 'pantry' },
  'Classico Alfredo': { aisle: 'pantry' },
  'Prego meat sauce': { aisle: 'pantry' },
  bread: { aisle: 'bakery' },
  'deli ham': { aisle: 'deli' },
  'deli turkey': { aisle: 'deli' },
  pepperoni: { aisle: 'deli' },
  SunButter: { aisle: 'pantry' },
  jelly: { aisle: 'pantry' },
} as const satisfies Record<string, IngredientInfo>
