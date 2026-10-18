import type { Recipe } from '../src/types'

export default {
  title: 'French Toast',
  kidFriendly: true,
  protein: 'egg',
  method: 'stovetop',
  source: 'Family recipe card',
  servings: 4,
  ingredients: [
    { item: 'bread', qty: 8, unit: 'slice' },
    { item: 'egg', qty: 4 },
    { item: '2% milk', qty: 0.25, unit: 'cup' },
    { item: 'sugar', qty: 2, unit: 'tbsp' },
    { item: 'butter', qty: 4, unit: 'tbsp' },
    { item: 'cinnamon', qty: 1, unit: 'tsp' },
    { item: 'vanilla extract', qty: 1, unit: 'tsp' },
  ],
  steps: [
    'Combine the ingredients.',
    'Dip the bread.',
    'Fry until golden brown.',
  ],
  notes: [
    'Card is the dairy-free version with 1/4 cup vanilla almond milk; we use 2% milk instead.',
  ],
} satisfies Recipe
