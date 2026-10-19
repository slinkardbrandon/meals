import type { Recipe } from '../src/types'

export default {
  title: 'Breakfast Burritos',
  kidFriendly: true,
  protein: 'egg',
  method: 'stovetop',
  ingredients: [
    { item: 'tater tots', qty: 1, unit: 'bag' },
    { item: 'egg', qty: 12 },
    { item: 'Jimmy Dean sausage', qty: 1, unit: 'lb', note: 'mild or regular' },
    { item: 'salt' },
    { item: 'black pepper' },
    { item: 'flour tortilla', qty: 1, unit: 'pkg' },
  ],
  steps: [
    'Air fry the tater tots for about 10 minutes.',
    'Scramble the eggs in a cup and set aside.',
    'Brown the sausage.',
    'Add the eggs to the sausage and cook through. Season with salt and pepper.',
    'Serve the egg and sausage mix on tortillas with the tater tots.',
  ],
  notes: [
    'Cooked by vibes, no source recipe. About a dozen eggs; 1 lb sausage is plenty.',
  ],
} satisfies Recipe
