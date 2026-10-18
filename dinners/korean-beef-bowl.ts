import type { Recipe } from '../src/types'

export default {
  title: 'Korean Beef Bowl',
  kidFriendly: true,
  protein: 'beef',
  method: 'stovetop',
  source: 'https://www.wellplated.com/korean-beef-bowl/',
  ingredients: [
    { item: 'long grain rice', qty: 2, unit: 'cup', note: 'washed' },
    { item: 'rice vinegar', qty: 4, unit: 'tbsp' },
    { item: 'sugar', qty: 1, unit: 'tsp' },
    { item: 'salt', qty: 1, unit: 'tsp' },
    { item: 'shredded carrots', qty: 0.75, unit: 'bag' },
    { item: 'mini cucumber', qty: 1, unit: 'pkg', note: 'sliced' },
    { item: 'ground beef', qty: 2, unit: 'lb' },
    { item: "Sweet Baby Ray's teriyaki sauce", qty: 0.5, unit: 'bottle', note: 'to taste' },
  ],
  steps: [
    'Wash and start the rice first; it takes the longest.',
    'Mix 4 tbsp water with the rice vinegar, sugar, and salt in a mixing bowl.',
    'Add the shredded carrots and sliced cucumbers to the vinegar mix. Stir every 5 or so minutes so all the veggies get time in the pickle bath.',
    'When there are 15-20 minutes left on the rice, cook the ground beef. Break it up so it is finely ground, not clumpy, and keep the heat moderate so it does not get chewy or hard.',
    'Once cooked, drain a little of the fat. Not in the sink.',
    'Add teriyaki sauce to taste (about half a bottle). Once mixed, turn the heat down and simmer until the rice is done.',
  ],
  notes: [
    "We make our own version from handwritten instructions: Sweet Baby Ray's teriyaki instead of the Well Plated sauce, plus quick-pickled carrots and cucumbers.",
  ],
} satisfies Recipe
