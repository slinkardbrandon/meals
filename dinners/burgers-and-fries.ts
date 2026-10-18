import type { Recipe } from '../src/types'

export default {
  title: 'Burgers and Fries',
  kidFriendly: true,
  protein: 'beef',
  method: 'grill',
  source: 'https://www.traeger.com/recipes/traeger-classic-burger',
  servings: 4,
  ingredients: [
    { item: 'ground beef', qty: 1, unit: 'lb', note: '80/20' },
    { item: 'salt' },
    { item: 'black pepper' },
    { item: 'butter', note: 'melted, for the griddle and buns' },
    { item: 'white onion', qty: 2, note: 'thinly sliced' },
    { item: 'American cheese', qty: 4, unit: 'slice' },
    { item: 'hamburger buns', qty: 4 },
    { item: 'dill pickles', note: 'sliced' },
    { item: 'ketchup' },
    { item: 'yellow mustard' },
    { item: 'frozen french fries', qty: 1, unit: 'bag' },
  ],
  steps: [
    'Put a cast iron griddle on the grill grates. Preheat to 450°F with the lid closed for 15 minutes.',
    'Divide the beef into four 4 oz balls. Season with Traeger Beef Rub, or salt and pepper.',
    'Grease the griddle with melted butter. Start the onions caramelizing on a corner of it.',
    'Smash the balls on the griddle to about 1/2 inch thick. Cook until the bottoms are well browned.',
    'Flip, top with onions, then cheese. Cook until the cheese melts.',
    'Brush the buns with butter and toast them on the griddle.',
    'Build: sauce, patty, pickles, more sauce, top bun.',
    'Cook the fries per the bag.',
  ],
  notes: [
    'Source uses hickory pellets and potato buns. Traeger Beef Rub is optional; salt and pepper works.',
    'We skip the source\'s 2 cups shredded iceberg lettuce.',
    'The fries are ours, usually Ore-Ida frozen fries.',
  ],
} satisfies Recipe
