import type { Recipe } from '../src/types'

export default {
  title: 'Dual-Sauce Cheesy Spaghetti Bake',
  kidFriendly: true,
  protein: 'beef',
  method: 'oven',
  ingredients: [
    { item: 'ground beef', qty: 1, unit: 'lb' },
    { item: 'thin spaghetti', qty: 1, unit: 'lb' },
    { item: 'Classico Alfredo', qty: 1, unit: 'jar' },
    { item: 'Prego meat sauce', qty: 1, unit: 'jar' },
  ],
  steps: [],
} satisfies Recipe
