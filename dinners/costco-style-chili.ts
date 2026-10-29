import type { Recipe } from '../src/types'

export default {
  title: 'Costco Style Chili',
  kidFriendly: true,
  protein: 'beef',
  method: 'stovetop',
  source: 'Family recipe card',
  ingredients: [
    { item: 'ground beef', qty: 2, unit: 'lb' },
    { item: 'yellow onion', qty: 1, note: 'diced' },
    { item: 'minced garlic', qty: 2, unit: 'tbsp' },
    { item: 'chili powder', qty: 1, unit: 'tbsp' },
    { item: 'cumin', qty: 1, unit: 'tbsp' },
    { item: 'paprika', qty: 2, unit: 'tsp' },
    { item: 'salt', note: 'eyeball it, a lot' },
    { item: 'black pepper', note: 'eyeball it' },
    { item: 'Tabasco', note: 'at least 4 rounds of 3-5 shakes' },
    { item: 'kidney beans', qty: 2, unit: 'can' },
    { item: 'diced tomatoes', qty: 1, unit: 'can', note: 'with juice' },
    { item: 'Fritos Scoops', qty: 1, unit: 'bag', note: 'for scooping' },
  ],
  steps: [
    'Brown the beef with the onion and garlic in a large pot. Drain.',
    'Stir in the chili powder, cumin, paprika, salt, and pepper.',
    'Add the kidney beans and the diced tomatoes with their juice.',
    'Add Tabasco in rounds of 3-5 shakes, at least 4 rounds, tasting as you go.',
    'Simmer until heated through and thickened.',
    'Serve with Fritos Scoops for scooping.',
  ],
  notes: [
    'Card is an ingredient list only; the steps are ours.',
    'Fritos Scoops are our addition; not on the card.',
  ],
} satisfies Recipe
