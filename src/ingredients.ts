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
  'Olive Garden Italian dressing': { aisle: 'pantry', aliases: ['Italian dressing'] },
  'brown sugar': { aisle: 'pantry', staple: true },
  'Worcestershire sauce': { aisle: 'pantry', staple: true },
  'hot sauce': { aisle: 'pantry', staple: true, aliases: ['Cholula', 'Red Devil cayenne'] },
  cornstarch: { aisle: 'pantry', staple: true },
  salt: { aisle: 'spices', staple: true },
  'black pepper': { aisle: 'spices', staple: true, aliases: ['pepper'] },
  'garlic powder': { aisle: 'spices', staple: true },
  'Jimmy Dean sausage': { aisle: 'meat', aliases: ['breakfast sausage', 'pork sausage', 'sausage'] },
  'all-purpose flour': { aisle: 'pantry', staple: true, aliases: ['flour'] },
  '2% milk': { aisle: 'dairy', aliases: ['milk'] },
  'Pillsbury flaky biscuits': { aisle: 'dairy', aliases: ['biscuits', 'canned biscuits'] },
} as const satisfies Record<string, IngredientInfo>
