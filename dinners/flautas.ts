import type { Recipe } from '../src/types'

export default {
  title: 'Flautas',
  kidFriendly: false,
  protein: 'chicken',
  method: 'stovetop',
  ingredients: [
    { item: 'chicken breast', qty: 2, unit: 'lb', note: 'cooked and shredded' },
    { item: 'corn tortilla', qty: 1, unit: 'pkg' },
    { item: 'canola oil', note: 'for frying' },
    { item: 'toothpicks' },
  ],
  steps: [
    'Cook and shred the chicken.',
    'Warm the corn tortillas so they roll without cracking.',
    'Roll chicken in each tortilla and pin it closed with a toothpick.',
    'Fry in canola oil until crisp. Pull the toothpicks before serving.',
  ],
  notes: [
    'Our own, no source.',
  ],
} satisfies Recipe
