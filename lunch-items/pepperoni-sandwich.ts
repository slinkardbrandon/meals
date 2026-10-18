import type { LunchItem } from '../src/types'

export default {
  title: 'Pepperoni Sandwich',
  category: 'main',
  kids: { wally: 'likes' },
  ingredients: [
    { item: 'bread', qty: 2, unit: 'slice' },
    { item: 'pepperoni' },
  ],
} satisfies LunchItem
