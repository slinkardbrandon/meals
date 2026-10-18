import type { Recipe } from '../src/types'

export default {
  title: 'Honey Garlic Chicken',
  kidFriendly: true,
  protein: 'chicken',
  method: 'instant-pot',
  source: 'https://kristineskitchenblog.com/honey-garlic-instant-pot-chicken-breasts/',
  servings: 4,
  ingredients: [
    { item: 'soy sauce', qty: 0.25, unit: 'cup', note: 'low sodium' },
    { item: 'honey', qty: 0.25, unit: 'cup' },
    { item: 'minced garlic', qty: 2, unit: 'clove' },
    { item: 'black pepper', qty: 0.25, unit: 'tsp' },
    { item: 'chicken breast', qty: 1.5, unit: 'lb', note: 'boneless skinless' },
    { item: 'cornstarch', qty: 2, unit: 'tsp' },
  ],
  steps: [
    'Whisk 1/3 cup water (or chicken broth), the soy sauce, honey, garlic, and pepper in the Instant Pot until the honey dissolves.',
    'Add the chicken. Seal the lid with the valve on sealing.',
    'Pressure cook on high: 8 min for small (7-8 oz) breasts, 10 min for medium (10 oz), 11 min for large (12 oz). Add 3 min if frozen.',
    'Quick release. If the chicken was frozen, natural release for 10 minutes first.',
    'Check the chicken hits 165°F; if not, finish it on sauté. Move it to a plate.',
    'Stir the cornstarch into 1 tbsp water. On sauté, stir it into the pot and cook 2-3 minutes until thickened. Turn off and pull the inner pot.',
    'Slice the chicken and serve with the sauce.',
  ],
} satisfies Recipe
