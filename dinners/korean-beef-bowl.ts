import type { Recipe } from '../src/types'

export default {
  title: 'Korean Beef Bowl',
  kidFriendly: true,
  protein: 'beef',
  method: 'stovetop',
  source: 'https://www.wellplated.com/korean-beef-bowl/',
  ingredients: [
    { item: 'long grain rice', qty: 2, unit: 'cup', note: 'washed' },
    { item: 'mini cucumber', note: 'eyeball a bunch, chopped' },
    { item: 'matchstick carrots', note: 'eyeball a bunch' },
    { item: 'rice vinegar', qty: 4, unit: 'tbsp', note: 'for the pickle' },
    { item: 'salt', qty: 1, unit: 'tsp' },
    { item: 'sugar', qty: 1, unit: 'tsp' },
    { item: 'ground beef', qty: 2, unit: 'lb' },
    { item: 'soy sauce', qty: 2, unit: 'tbsp', note: 'for the beef' },
    { item: 'scallion', note: 'a handful, chopped' },
    { item: 'minced garlic', qty: 2, unit: 'tbsp' },
    { item: 'rice vinegar', qty: 4, unit: 'tbsp', note: 'for the sauce' },
    { item: 'soy sauce', qty: 4, unit: 'tbsp', note: 'for the sauce' },
    { item: 'honey', qty: 4, unit: 'tbsp' },
    { item: 'fresh ginger', qty: 4, unit: 'tbsp', note: 'grated' },
    { item: 'red pepper flakes', qty: 0.25, unit: 'tsp' },
  ],
  steps: [
    'Wash and start the rice first; it takes the longest.',
    'Pickle the veggies: mix 4 tbsp water with 4 tbsp rice vinegar, the salt, and the sugar. Toss in the cucumber and carrots and set aside. Drain before serving.',
    'Brown the ground beef, breaking it up so it is finely ground, not clumpy.',
    'Halfway through browning, add 2 tbsp soy sauce and the scallions, then the garlic.',
    'While the beef browns, mix the sauce: 4 tbsp each of rice vinegar, soy sauce, honey, and grated ginger, plus the red pepper flakes.',
    'Mix the sauce into the beef and serve over the rice with the pickled veggies.',
  ],
  notes: [
    'This is our double batch, with a homemade sauce instead of the Well Plated one. We used to use Sweet Baby Ray\'s teriyaki; not anymore.',
    'Rice amount (2 cups) and the finely-ground beef tip are from our older handwritten instructions.',
  ],
} satisfies Recipe
