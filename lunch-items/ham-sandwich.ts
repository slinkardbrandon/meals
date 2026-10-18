import type { LunchItem } from '../src/types'

export default {
  title: 'Ham Sandwich',
  category: 'main',
  kids: { sylvia: 'likes' },
  ingredients: [
    { item: 'bread', qty: 2, unit: 'slice' },
    { item: 'deli ham' },
  ],
} satisfies LunchItem
