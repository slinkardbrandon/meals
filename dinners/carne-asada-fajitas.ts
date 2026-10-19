import type { Recipe } from '../src/types'

export default {
  title: 'Carne Asada Fajitas',
  kidFriendly: true,
  protein: 'beef',
  method: 'stovetop',
  source: 'Family recipe card',
  ingredients: [
    { item: 'flank steak', qty: 2, unit: 'lb', note: 'or raw sirloin strips' },
    { item: 'yellow onion', qty: 2, note: 'sliced' },
    { item: 'bell pepper', qty: 4, note: 'sliced' },
    { item: 'vegetable oil' },
    { item: 'cornstarch', qty: 2, unit: 'tbsp', note: 'or flour; more if needed' },
    { item: 'chili powder', qty: 4, unit: 'tsp' },
    { item: 'salt', qty: 2, unit: 'tsp' },
    { item: 'paprika', qty: 2, unit: 'tsp' },
    { item: 'sugar', qty: 2, unit: 'tsp' },
    { item: 'onion powder', qty: 1, unit: 'tsp' },
    { item: 'garlic powder', qty: 1, unit: 'tsp' },
    { item: 'cumin', qty: 1, unit: 'tsp' },
    { item: 'cayenne', qty: 0.5, unit: 'tsp' },
  ],
  steps: [
    'Mix the cornstarch and spices into a seasoning.',
    'Season the steak with most of the seasoning in a bowl, saving some for the veggies.',
    'Cook the onions in oil with some of the seasoning until soft. Add the peppers and cook a little. Set aside.',
    'Put the seasoned meat into the pan with oil. Add 1/2 cup water.',
    'Cook through and add the veggies back in.',
  ],
  notes: [
    'Card says the onion and garlic powder can be swapped for 1 tsp garlic (2 tsp at our doubled size).',
    'Card gives no meat or veggie amounts; 1 lb steak, 1 onion, and 2 peppers are our estimates from the seasoning (about 2 1/2 tbsp of spices).',
    'We double the card for the family: 2 lb steak and twice the seasoning and water.',
    'We occasionally sub chicken for the steak.',
  ],
} satisfies Recipe
