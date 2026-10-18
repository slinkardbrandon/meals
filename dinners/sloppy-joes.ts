import type { Recipe } from '../src/types'

export default {
  title: 'Sloppy Joes',
  kidFriendly: true,
  protein: 'beef',
  method: 'stovetop',
  source: 'https://www.allrecipes.com/recipe/24264/sloppy-joes-ii/',
  ingredients: [
    { item: 'ground beef', qty: 2, unit: 'lb' },
    { item: 'yellow onion', qty: 1, note: 'diced' },
    { item: 'bell pepper', qty: 1, note: 'diced' },
    { item: 'ketchup', qty: 1.5, unit: 'cup' },
    { item: 'brown sugar', qty: 2, unit: 'tbsp' },
    { item: 'yellow mustard', qty: 4, unit: 'tsp' },
    { item: 'garlic powder', qty: 2, unit: 'tsp' },
    { item: 'hamburger buns', qty: 1, unit: 'pkg' },
  ],
  steps: [
    'Brown the beef with the onion and bell pepper. Drain.',
    'Mix the ketchup, brown sugar, mustard, and garlic powder.',
    'Stir the sauce into the beef and simmer until heated through.',
    'Serve on hamburger buns.',
  ],
  notes: [
    'This is our double batch from the family recipe card. Single batch: 1 lb beef, 1/2 onion, 1/2 bell pepper, 3/4 cup ketchup, 1 tbsp brown sugar, 2 tsp mustard, 1 tsp garlic powder.',
    'Card is ingredients only; the steps and the buns are ours.',
  ],
} satisfies Recipe
