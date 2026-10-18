import type { Recipe } from '../src/types'

export default {
  title: 'Crock Pot Chicken and Gravy',
  kidFriendly: true,
  protein: 'chicken',
  method: 'crockpot',
  source: 'https://www.plainchicken.com/crock-pot-chicken-gravy/',
  ingredients: [
    { item: 'chicken breast', qty: 4, note: 'boneless, skinless; 3-4' },
    { item: 'cream of chicken soup', qty: 1, unit: 'can', note: '10.5 oz, unsalted' },
    { item: 'chicken gravy mix', qty: 2, unit: 'pkg', note: '0.87 oz envelopes' },
    { item: 'chicken broth', qty: 0.5, unit: 'cup', note: 'optional; or water' },
    { item: 'salt', note: 'to season' },
    { item: 'black pepper', note: 'to season' },
    { item: 'long grain rice', note: 'steamed, for serving' },
  ],
  steps: [
    'Season the chicken and place it in the crock pot.',
    'Whisk the soup, gravy mix, and broth or water together and pour over the chicken.',
    'Cook on LOW 4-6 hours.',
    'Add more water or broth if the gravy is too thick. Serve over rice.',
  ],
} satisfies Recipe
