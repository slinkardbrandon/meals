import type { Recipe } from '../src/types'

export default {
  title: 'Beef Noodle Casserole',
  kidFriendly: false,
  protein: 'beef',
  method: 'oven',
  source: 'Family recipe card',
  ingredients: [
    { item: 'egg noodles', qty: 12, unit: 'oz' },
    { item: 'olive oil', qty: 2, unit: 'tsp' },
    { item: 'ground beef', qty: 1, unit: 'lb' },
    { item: 'yellow onion', qty: 1 },
    { item: 'minced garlic', qty: 2, unit: 'tsp' },
    { item: 'salt', note: 'to taste' },
    { item: 'black pepper', note: 'to taste' },
    { item: 'tomato sauce', qty: 3, unit: 'can', note: '8 oz cans, 24 oz total' },
    { item: 'diced tomatoes', qty: 1, unit: 'can', note: '15 oz, petite diced' },
    { item: 'Italian seasoning', qty: 2, unit: 'tsp' },
    { item: 'shredded cheddar', qty: 2, unit: 'cup' },
    { item: 'cooking spray' },
  ],
  steps: [
    'Cook the egg noodles. Preheat the oven to 400°F.',
    'Heat the olive oil and cook the beef for 4-5 minutes.',
    'Add the onion, garlic, salt, and pepper. Cook until the onions are soft.',
    'Add the tomato sauce, diced tomatoes, and Italian seasoning to the beef.',
    'Add the noodles to the beef.',
    'Pour the mix into a 9x13 pan, or 2 small ones, sprayed with cooking spray.',
    'Top with the cheddar. Bake 10-15 minutes.',
  ],
  notes: [
    'Card says ground beef or turkey; we use beef.',
  ],
} satisfies Recipe
