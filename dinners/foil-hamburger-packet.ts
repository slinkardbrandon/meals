import type { Recipe } from '../src/types'

export default {
  title: 'Foil Hamburger Packet',
  kidFriendly: false,
  protein: 'beef',
  method: 'oven',
  source: 'Family recipe card',
  servings: 4,
  ingredients: [
    { item: 'ground beef', qty: 1, unit: 'lb' },
    { item: 'onion soup mix', qty: 1, unit: 'pkg' },
    { item: 'potato', qty: 4, note: 'small, peeled and thinly sliced' },
    { item: 'carrot', qty: 2, unit: 'cup', note: 'thinly sliced' },
    { item: 'olive oil', qty: 2, unit: 'tbsp' },
    { item: 'garlic powder', qty: 1, unit: 'tsp' },
    { item: 'salt', note: 'to taste' },
    { item: 'black pepper', note: 'to taste' },
    { item: 'cream of mushroom soup', qty: 1, unit: 'can', note: 'condensed' },
    { item: 'yellow onion', note: 'optional, cut into strips, not diced' },
    { item: 'cooking spray' },
  ],
  steps: [
    'Preheat the oven to 375°F.',
    'Combine the beef and onion soup mix. Make 4 patties.',
    'Combine the remaining ingredients except the mushroom soup.',
    'Cut four 12" x 18" sheets of foil and spray them.',
    'On each foil sheet, place 1/4 of the veggie mixture, top with a patty, and add 2 tbsp of the mushroom soup.',
    'Fold the packets and place them beef side up on a baking sheet.',
    'Bake 35-45 minutes, or until the veggies are tender.',
  ],
} satisfies Recipe
