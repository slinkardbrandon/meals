import type { LunchItem } from '../src/types'

export default {
  title: 'SunButter & Jelly',
  category: 'main',
  kids: { sylvia: 'tolerates', wally: 'tolerates' },
  ingredients: [
    { item: 'bread', qty: 2, unit: 'slice' },
    { item: 'SunButter' },
    { item: 'jelly' },
  ],
} satisfies LunchItem
