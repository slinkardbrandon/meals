import type { Recipe } from '../src/types'

export default {
  title: 'Chicken Fried Rice',
  kidFriendly: true,
  protein: 'chicken',
  method: 'stovetop',
  source: 'https://spoonsofflavor.com/hibachi-style-fried-rice/',
  ingredients: [
    { item: 'long grain rice', qty: 1.5, unit: 'cup', note: 'dry; makes about 4 1/2 cups cooked' },
    { item: 'chicken breast', qty: 2, unit: 'lb', note: 'bite-sized cubes' },
    { item: 'egg', qty: 8, note: 'lightly beaten' },
    { item: 'yellow onion', qty: 2, note: 'diced' },
    { item: 'minced garlic', qty: 5, unit: 'tsp', note: 'source says 2-3 cloves for 2 servings; 1/2 tsp per clove, scaled 4x' },
    { item: 'carrot', qty: 2, note: 'small dice' },
    { item: 'olive oil', qty: 6, unit: 'tbsp' },
    { item: 'butter', qty: 4, unit: 'tbsp' },
    { item: 'soy sauce', qty: 4, unit: 'tbsp' },
    { item: 'white pepper' },
    { item: 'salt' },
    { item: 'scallion', qty: 8, note: 'chopped' },
    { item: 'sesame oil', qty: 2, unit: 'tsp', optional: true, note: 'toasted' },
  ],
  steps: [
    'Cook the rice first. Spread it on a sheet pan to cool and dry out while you prep.',
    'Toss the chicken with salt, white pepper, and soy sauce. Beat the eggs. Dice the onion and carrot; chop the scallions.',
    'Heat a wok or large skillet over medium-high. Cook the chicken in the olive oil until golden and cooked through. Set aside.',
    'In the same pan, melt the butter. Sauté the garlic a few seconds, then the onion and carrot for about a minute.',
    'Add the rice and stir fry over high heat for 1-2 minutes. Season with a little salt and white pepper.',
    'Push the rice aside, scramble the eggs until just set, then mix them in.',
    'Drizzle soy sauce around the pan edges to sizzle, then toss to coat.',
    'Add the chicken back and toss for another minute.',
    'Adjust seasoning. Add the scallions and sesame oil, turn off the heat, and serve.',
  ],
  notes: [
    'Untested: we usually wing fried rice, and this is a reference recipe we have not made. It serves 2; we scale it 4x for the family (2 lb chicken). Cook in batches if the pan crowds.',
    'Source calls for day-old rice; we cook it fresh and dry it on a sheet pan instead.',
  ],
} satisfies Recipe
