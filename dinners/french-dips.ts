import type { Recipe } from '../src/types'

export default {
  title: 'French Dips',
  kidFriendly: true,
  protein: 'beef',
  method: 'crockpot',
  source: 'https://www.thecountrycook.net/crock-pot-french-dip-sandwiches/',
  servings: 6,
  ingredients: [
    { item: 'chuck roast', qty: 3.5, unit: 'lb', note: '3-4 lb' },
    { item: 'vegetable oil', note: 'for browning' },
    { item: 'onion soup mix', qty: 1, unit: 'pkg' },
    { item: 'au jus seasoning', qty: 1, unit: 'pkg' },
    { item: 'beef broth', qty: 15, unit: 'oz' },
    { item: 'sliced provolone', qty: 6, unit: 'slice', note: 'or mozzarella' },
    { item: 'sub rolls', qty: 6 },
  ],
  steps: [
    'Brown both sides of the beef in a hot pan with a little oil. Do not cook it through.',
    'Put the beef in the slow cooker.',
    'Stir together the onion soup mix, au jus seasoning, beef broth, and 1/2 cup water. Pour over the beef.',
    'Cook on low for about 8 hours. Do not use high, and do not lift the lid; the meat gets tough.',
    'An hour before serving, shred with two forks or slice thinly. Return to the slow cooker for about an hour.',
    'Lay the rolls open-faced on a baking sheet. Top one side with beef, then a cheese slice.',
    'Broil on high until the cheese melts and the rolls toast. Watch it closely; it burns fast.',
    'Serve with au jus from the slow cooker, strained if you like.',
  ],
  notes: [
    'Source calls for round steak; we use chuck roast, which it lists as an alternative.',
    'Source marks browning as optional; we always do it.',
  ],
} satisfies Recipe
