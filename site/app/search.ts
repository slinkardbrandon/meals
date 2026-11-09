import Fuse from 'fuse.js'
import type { SiteRecipe } from './types'

export const MAX_RESULTS = 8

/** Fuzzy recipe search. Pure; no DOM. */
export const createSearch = (recipes: SiteRecipe[]) => {
  const fuse = new Fuse(recipes, {
    keys: [
      { name: 'title', weight: 3 },
      'description',
      'protein',
      'method',
      'ingredients.text',
    ],
    threshold: 0.4,
  })
  return (query: string): SiteRecipe[] => {
    const q = query.trim()
    return q ? fuse.search(q, { limit: MAX_RESULTS }).map(r => r.item) : []
  }
}
