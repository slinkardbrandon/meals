import type { Recipe } from '../src/types'

export default {
  title: 'Chef Salad',
  kidFriendly: false,
  protein: 'mixed',
  method: 'no-cook',
  ingredients: [
    { item: 'romaine' },
    { item: 'baby spinach' },
    { item: 'egg', note: 'hard boiled' },
    { item: 'deli turkey', note: 'or deli ham' },
    { item: 'shredded cheddar' },
    { item: 'matchstick carrots' },
    { item: 'cucumber' },
    { item: 'salt' },
    { item: 'black pepper' },
    { item: 'apple', note: 'optional' },
    { item: 'mayonnaise', qty: 1, unit: 'cup', note: 'ranch' },
    { item: 'plain yogurt', qty: 1, unit: 'cup', note: 'ranch' },
    { item: 'Italian dressing mix', qty: 1, unit: 'pkg', note: 'ranch' },
  ],
  steps: [
    'Hard boil the eggs, cool, and slice.',
    'Whisk the mayo, yogurt, and Italian dressing mix into ranch.',
    'Toss the romaine and spinach. Top with eggs, deli meat, cheddar, carrots, cucumber, and apple if using.',
    'Season with salt and pepper. Serve with the ranch.',
  ],
  notes: [
    'Our own, no source.',
    'The ranch batch makes far more than one salad needs. Leftovers keep in the fridge.',
  ],
} satisfies Recipe
