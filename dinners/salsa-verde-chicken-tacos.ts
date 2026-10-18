import type { Recipe } from '../src/types'

export default {
  title: 'Salsa Verde Chicken Tacos',
  kidFriendly: true,
  protein: 'chicken',
  method: 'crockpot',
  source: 'https://downshiftology.com/recipes/crockpot-salsa-verde-chicken/',
  servings: 6,
  ingredients: [
    { item: 'chicken breast', qty: 2, unit: 'lb', note: 'boneless skinless' },
    { item: 'salsa verde', qty: 2, unit: 'cup' },
    { item: 'salt', qty: 1, unit: 'tsp', note: 'kosher' },
    { item: 'cumin', qty: 1, unit: 'tsp' },
    { item: 'cilantro', qty: 2, unit: 'tbsp', note: 'chopped, for garnish' },
    { item: 'sour cream', note: 'optional, for a creamier texture' },
    { item: 'flour tortilla', qty: 1, unit: 'pkg' },
  ],
  steps: [
    'Mix the chicken, salsa verde, salt, and cumin in the slow cooker.',
    'Cook 2 1/2 to 3 hours on high, or 4 to 5 hours on low.',
    'Pull the chicken out and shred with two forks.',
    'Stir the chicken back into the slow cooker, with sour cream if using.',
    'Garnish with cilantro. Serve with tortillas on the side.',
  ],
  notes: [
    'Chicken slow cooked in salsa verde, tortillas on the side. Also called salsa chicken / chicken tacos.',
    'The tortillas are ours; the source serves it on its own.',
  ],
} satisfies Recipe
