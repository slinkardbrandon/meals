import type { Recipe } from '../src/types'

export default {
  title: 'Shredded BBQ Chicken',
  kidFriendly: false,
  protein: 'chicken',
  method: 'crockpot',
  source: 'Family recipe card',
  ingredients: [
    { item: 'chicken breast', qty: 2, unit: 'lb', note: 'about 4 breasts' },
    { item: "Sweet Baby Ray's honey BBQ sauce", qty: 1, unit: 'cup' },
    { item: 'Olive Garden Italian dressing', qty: 0.25, unit: 'cup' },
    { item: 'brown sugar', qty: 0.25, unit: 'cup' },
    { item: 'Worcestershire sauce', qty: 1, unit: 'tbsp' },
    { item: 'cornstarch', qty: 2, unit: 'tbsp' },
    { item: 'hot sauce', note: 'a dash; Cholula or Red Devil cayenne' },
    { item: 'salt', note: 'to taste' },
    { item: 'black pepper', note: 'to taste' },
    { item: 'garlic powder', note: 'to taste' },
  ],
  steps: [
    'Mix the BBQ sauce, Italian dressing, brown sugar, Worcestershire, cornstarch, and hot sauce in a bowl.',
    'Put the chicken in the crock pot and cover with the sauce.',
    'Cook on high for 4 hours.',
    'Shred the chicken and stir it back into the sauce. Season with salt, pepper, and garlic to taste.',
  ],
  notes: [
    "Card just says \"bbq\"; we use Sweet Baby Ray's honey BBQ.",
    'Card says "garlic" to taste; we read that as garlic powder.',
    'Card originally had soy sauce, crossed out for Worcestershire. Cornstarch was a later addition.',
  ],
} satisfies Recipe
