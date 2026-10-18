import type { Recipe } from '../src/types'

export default {
  title: 'Spaghetti and Meatballs',
  kidFriendly: true,
  protein: 'beef',
  method: 'stovetop',
  ingredients: [
    { item: 'Good & Gather beef meatballs', qty: 1, unit: 'bag', note: '26 oz, frozen' },
    { item: 'Prego meat sauce', qty: 1, unit: 'jar' },
    { item: 'pasta', qty: 1, unit: 'box', note: 'any shape: thin spaghetti, cavatappi, rotini, elbows, or farfalle' },
  ],
  steps: [
    'Start the water boiling for the pasta.',
    'Heat the frozen meatballs in the sauce until hot through.',
    'Cook the pasta per the box and drain.',
    'Toss the pasta with the sauce and meatballs.',
  ],
  notes: [
    'Frozen meatballs cooked in red sauce, added to simple red sauce pasta.',
    'Pasta shape changes with our mood; grab whichever.',
  ],
} satisfies Recipe
