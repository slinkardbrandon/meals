import type { Recipe } from '../src/types'

export default {
  title: 'Chickpea Noodle Soup',
  kidFriendly: false,
  protein: 'chickpea',
  method: 'stovetop',
  source: 'Family recipe card',
  ingredients: [
    { item: 'yellow onion', qty: 1, note: 'chopped' },
    { item: 'minced garlic', qty: 5, unit: 'tsp' },
    { item: 'celery', qty: 3, note: 'stalks, chopped' },
    { item: 'carrot', qty: 3, note: 'chopped' },
    { item: 'chickpeas', qty: 1, unit: 'can', note: 'drained' },
    { item: 'egg noodles', qty: 0.5, unit: 'bag', note: '6 oz' },
    { item: 'vegetable stock', qty: 2, unit: 'box', note: '6 cups, plus more to finish' },
    { item: 'dried parsley', qty: 1, unit: 'tsp' },
    { item: 'dried oregano', qty: 0.5, unit: 'tsp' },
    { item: 'dried thyme', qty: 0.25, unit: 'tsp' },
    { item: 'ground sage', qty: 0.5, unit: 'tsp' },
    { item: 'salt', qty: 0.5, unit: 'tsp' },
    { item: 'black pepper', qty: 0.5, unit: 'tsp' },
  ],
  steps: [
    'Saute the onion, garlic, celery, and carrots for 5-7 minutes.',
    'Add the spices and chickpeas.',
    'Add 6 cups of broth and cook at a light boil for 15 minutes, or until the carrots and celery have softened.',
    'Add the pasta and cook according to the package instructions.',
    'Add more broth to make it soupy again.',
  ],
} satisfies Recipe
