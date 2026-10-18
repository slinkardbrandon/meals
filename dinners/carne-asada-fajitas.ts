import type { Recipe } from '../src/types'

export default {
  title: 'Carne Asada Fajitas',
  kidFriendly: true,
  protein: 'beef',
  method: 'stovetop',
  source: 'Family recipe card',
  ingredients: [
    { item: 'flank steak', qty: 1, unit: 'lb', note: 'or raw sirloin strips' },
    { item: 'yellow onion' },
    { item: 'bell pepper' },
    { item: 'vegetable oil' },
    { item: 'cornstarch', qty: 1, unit: 'tbsp', note: 'or flour; more if needed' },
    { item: 'chili powder', qty: 2, unit: 'tsp' },
    { item: 'salt', qty: 1, unit: 'tsp' },
    { item: 'paprika', qty: 1, unit: 'tsp' },
    { item: 'sugar', qty: 1, unit: 'tsp' },
    { item: 'onion powder', qty: 0.5, unit: 'tsp' },
    { item: 'garlic powder', qty: 0.5, unit: 'tsp' },
    { item: 'cumin', qty: 0.5, unit: 'tsp' },
    { item: 'cayenne', qty: 0.25, unit: 'tsp' },
  ],
  steps: [
    'Mix the cornstarch and spices into a seasoning.',
    'Season the steak with most of the seasoning in a bowl, saving some for the veggies.',
    'Cook the onions in oil with some of the seasoning until soft. Add the peppers and cook a little. Set aside.',
    'Put the seasoned meat into the pan with oil. Add 1/4 cup water.',
    'Cook through and add the veggies back in.',
  ],
  notes: [
    'Card says the onion and garlic powder can be swapped for 1 tsp garlic.',
    'Card gives no meat amount; 1 lb is our estimate from the seasoning (about 2 1/2 tbsp of spices).',
  ],
} satisfies Recipe
