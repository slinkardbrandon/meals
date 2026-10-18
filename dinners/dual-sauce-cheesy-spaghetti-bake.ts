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
    { item: 'shredded cheddar', note: 'for topping' },
    { item: 'shredded mozzarella', note: 'for topping' },
    { item: 'cream cheese', optional: true, note: 'if we have it' },
    { item: 'yellow onion', optional: true },
  ],
  steps: [
    'Preheat the oven to 350°F and start the water boiling.',
    'Brown the beef, with the onion if using.',
    'Cook the spaghetti al dente, at the low end of the package time.',
    'In the big pot, mix the beef, noodles, both jars of sauce, and cream cheese if using.',
    'Dump into an oven-safe pan and top with cheddar and mozzarella.',
    'Bake until the cheese melts.',
  ],
  notes: [
    'Our own recipe, no source.',
  ],
} satisfies Recipe
