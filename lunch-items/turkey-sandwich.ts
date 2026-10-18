import type { LunchItem } from '../src/types'

export default {
  title: 'Turkey Sandwich',
  category: 'main',
  kids: { sylvia: 'likes', wally: 'likes' },
  ingredients: [
    { item: 'bread', qty: 2, unit: 'slice' },
    { item: 'deli turkey' },
  ],
} satisfies LunchItem
