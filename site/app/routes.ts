export type Route =
  | { name: 'home' }
  | { name: 'plans' }
  | { name: 'plan'; week: string }
  | { name: 'recipes' }
  | { name: 'recipe'; id: string }
  | { name: 'notFound' }

/** Parses `#/plans/2026-W46` style hashes. Unknown weeks and ids are resolved by the views. */
export const parseRoute = (hash: string): Route => {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  const [section, param, ...extra] = parts
  if (extra.length) return { name: 'notFound' }
  if (!section) return { name: 'home' }
  if (section === 'plans') return param ? { name: 'plan', week: param } : { name: 'plans' }
  if (section === 'recipes') return param ? { name: 'recipe', id: param } : { name: 'recipes' }
  return { name: 'notFound' }
}

export const href = {
  home: '#/',
  plans: '#/plans',
  plan: (week: string) => `#/plans/${encodeURIComponent(week)}`,
  recipes: '#/recipes',
  recipe: (id: string) => `#/recipes/${encodeURIComponent(id)}`,
}
