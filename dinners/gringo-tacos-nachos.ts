import type { Recipe } from '../src/types'

export default {
  title: 'Gringo Tacos / Nachos',
  description: 'Seasoned beef and black beans, served build-your-own as tacos or nachos.',
  kidFriendly: true,
  protein: 'beef',
  method: 'stovetop',
  ingredients: [
    { item: 'ground beef', qty: 2, unit: 'lb' },
    { item: 'black beans', qty: 1, unit: 'can' },
    { item: 'Chef Merito carne asada seasoning', note: 'heavy' },
    { item: 'garlic powder' },
    { item: 'onion powder' },
    { item: 'paprika' },
    { item: 'chili powder' },
    { item: 'flour tortilla', qty: 1, unit: 'pkg' },
    { item: 'Old El Paso hard taco shells', qty: 1, unit: 'box' },
    { item: 'Doritos', qty: 1, unit: 'bag' },
    { item: 'yellow onion', note: 'diced, for topping' },
    { item: 'shredded lettuce', qty: 1, unit: 'bag' },
    { item: 'sour cream' },
    { item: 'shredded cheddar' },
    { item: 'canned corn', qty: 1, unit: 'can', note: 'optional' },
  ],
  steps: [
    'Brown the beef.',
    'Add the black beans. Season heavily with carne asada seasoning, garlic powder, onion powder, paprika, and chili powder.',
    'Serve with tortillas, hard shells, and Doritos, plus the toppings, build-your-own.',
  ],
  notes: [
    'Our own, no source. Seasonings are eyeballed.',
  ],
} satisfies Recipe
