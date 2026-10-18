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
  'chicken breast': { aisle: 'meat', aliases: ['chicken breasts', 'boneless skinless chicken breast'] },
  "Sweet Baby Ray's honey BBQ sauce": { aisle: 'pantry', aliases: ['bbq sauce', 'barbecue sauce'] },
  'Italian dressing': { aisle: 'pantry' },
  'brown sugar': { aisle: 'pantry', staple: true },
  'Worcestershire sauce': { aisle: 'pantry', staple: true },
  'hot sauce': { aisle: 'pantry', staple: true },
  cornstarch: { aisle: 'pantry', staple: true },
  salt: { aisle: 'spices', staple: true },
  'black pepper': { aisle: 'spices', staple: true, aliases: ['pepper'] },
  'garlic powder': { aisle: 'spices', staple: true },
} as const satisfies Record<string, IngredientInfo>
