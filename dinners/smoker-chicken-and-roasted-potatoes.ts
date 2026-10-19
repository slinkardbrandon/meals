import type { Recipe } from '../src/types'

export default {
  title: 'Smoker Chicken & Roasted Potatoes',
  kidFriendly: false,
  protein: 'chicken',
  method: 'smoker',
  source: 'https://www.dinneratthezoo.com/roasted-red-potatoes/',
  ingredients: [
    { item: 'chicken breast', qty: 2, unit: 'lb', note: 'usually Smart Chicken' },
    { item: 'Traeger Pork & Poultry Rub' },
    { item: 'baby red potatoes', qty: 1.5, unit: 'lb', note: 'halved' },
    { item: 'olive oil', qty: 0.25, unit: 'cup' },
    { item: 'minced garlic', qty: 2, unit: 'tsp' },
    { item: 'salt', qty: 1.5, unit: 'tsp' },
    { item: 'black pepper', qty: 0.5, unit: 'tsp' },
    { item: 'Italian seasoning', qty: 1, unit: 'tsp' },
    { item: 'grated parmesan', qty: 0.25, unit: 'cup', note: 'finely grated' },
    { item: 'fresh parsley', qty: 2, unit: 'tbsp', note: 'chopped' },
    { item: 'cooking spray' },
  ],
  steps: [
    'Butterfly the chicken breasts and cover them in the rub.',
    'Smoke the chicken until cooked through (165°F).',
    'Potatoes: preheat the oven to 400°F. Line a sheet pan with foil and coat with cooking spray.',
    'Toss the potatoes with the olive oil, garlic, salt, pepper, Italian seasoning, and parmesan.',
    'Spread in a single layer and bake 35-40 minutes, until golden and fork tender. Sprinkle with parsley.',
  ],
  notes: [
    'Source link is for the potatoes; the chicken is ours.',
  ],
} satisfies Recipe
