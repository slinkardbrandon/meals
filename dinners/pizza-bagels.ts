import type { Recipe } from '../src/types'

export default {
  title: 'Pizza Bagels',
  kidFriendly: true,
  protein: 'pork',
  method: 'air-fryer',
  ingredients: [
    { item: "Thomas' plain bagels", qty: 1, unit: 'pkg' },
    { item: 'Prego meat sauce', qty: 1, unit: 'jar' },
    { item: 'shredded mozzarella' },
    { item: 'shredded cheddar' },
    { item: 'pepperoni' },
  ],
  steps: [
    'Split the bagels. Top each half with sauce, mozzarella, cheddar, and pepperoni.',
    'Air fry until the cheese melts.',
  ],
  notes: [
    'Our own, no source.',
  ],
} satisfies Recipe
