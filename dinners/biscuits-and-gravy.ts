import type { Recipe } from '../src/types'

export default {
  title: 'Biscuits and Gravy',
  kidFriendly: true,
  protein: 'pork',
  method: 'stovetop',
  source: 'Family recipe card (Dairy-Free Biscuits and Gravy)',
  ingredients: [
    { item: 'Jimmy Dean sausage', qty: 1, unit: 'lb', note: 'regular or mild, never hot' },
    { item: 'all-purpose flour', qty: 0.25, unit: 'cup' },
    { item: '2% milk', qty: 2.5, unit: 'cup' },
    { item: 'Pillsbury flaky biscuits', qty: 1, unit: 'can' },
    { item: 'black pepper', note: 'to taste' },
  ],
  steps: [
    'Preheat the oven and bake the biscuits.',
    'Start cooking the sausage in a frying pan.',
    'Once the sausage is fully browned, add the flour.',
    'Slowly add the milk until it thickens; repeat until the milk is gone.',
    'Pepper to taste.',
  ],
  notes: [
    'Card is the dairy-free version with cashew milk; we use 2% milk instead. Use 2 1/2 cups cashew milk to make it dairy-free.',
  ],
} satisfies Recipe
