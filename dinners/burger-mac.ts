import type { Recipe } from '../src/types'

export default {
  title: 'Burger Mac',
  kidFriendly: true,
  protein: 'beef',
  method: 'stovetop',
  ingredients: [
    { item: 'ground beef', qty: 1, unit: 'lb' },
    { item: "Annie's Shells & White Cheddar", qty: 2, unit: 'box' },
    { item: '2% milk', note: 'per the box' },
    { item: 'butter', note: 'per the box' },
  ],
  steps: [
    'Start the water boiling and brown the beef while it heats.',
    'Make both boxes of mac and cheese per the back of the box.',
    'Mix the beef into the mac and cheese.',
  ],
  notes: [
    'No source recipe; it is the Annie\'s box directions plus beef.',
  ],
} satisfies Recipe
