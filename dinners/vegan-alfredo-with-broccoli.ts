import type { Recipe } from '../src/types'

export default {
  title: 'Vegan Alfredo with Broccoli',
  kidFriendly: false,
  protein: 'none',
  method: 'stovetop',
  source: 'https://thevegan8.com/vegan-garlic-alfredo-sauce/',
  ingredients: [
    { item: 'white onion', qty: 1, note: 'medium, diced; 1 1/2 cups' },
    { item: 'vegetable stock', qty: 2, unit: 'cup', note: 'low sodium; 1-2 cups, divided' },
    { item: 'salt', qty: 0.5, unit: 'tsp', note: '1/2-3/4 tsp' },
    { item: 'black pepper', qty: 0.25, unit: 'tsp', note: '1/4-1/2 tsp' },
    { item: 'minced garlic', qty: 3, unit: 'tsp', note: 'source says 4 extra-large cloves; rounded up from 1/2 tsp per clove' },
    { item: 'raw cashews', qty: 0.5, unit: 'cup', note: 'heaping; soak overnight without a high-powered blender' },
    { item: 'lemon juice', qty: 0.5, unit: 'tbsp', note: '1/2-1 tbsp, start low' },
    { item: 'nutritional yeast', qty: 2, unit: 'tbsp' },
    { item: 'thin spaghetti', qty: 1, unit: 'box' },
    { item: 'broccoli' },
  ],
  steps: [
    'Cook the onion in 1 cup of the broth over medium to medium-high, about 8 minutes, until very tender.',
    'Add the garlic and cook a couple of minutes more, until all the broth is gone.',
    'Blend the onion and garlic with 1/2 cup more broth, the salt, pepper, cashews, 1/2 tbsp lemon juice, and nutritional yeast until very smooth.',
    'Thin with more broth if needed. Taste and adjust salt, pepper, and lemon.',
    'Cook the spaghetti in well-salted water and the broccoli alongside. Toss with the sauce.',
  ],
  notes: [
    'Source makes about 2 cups of sauce and leaves the pasta and veggies open; thin spaghetti and broccoli are our picks.',
  ],
} satisfies Recipe
