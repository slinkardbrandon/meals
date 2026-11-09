import { useId, useState, type ReactNode } from 'react'
import type { SiteRecipe } from '../types'
import { RecipeLink } from './DinnerList'

type Props = {
  search: (query: string) => SiteRecipe[]
  /** Shown while the query is empty. */
  empty?: ReactNode
}

export const RecipeSearch = ({ search, empty }: Props) => {
  const [query, setQuery] = useState('')
  const id = useId()
  const active = query.trim() !== ''
  const results = active ? search(query) : []

  return (
    <div>
      <label htmlFor={id} className="sr-only">Search recipes</label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search recipes"
        autoCapitalize="off"
        autoComplete="off"
        enterKeyHint="search"
        className="mb-3 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-4 text-lg placeholder:text-stone-500 focus:border-emerald-800 focus:outline-2 focus:outline-emerald-800"
      />
      <p aria-live="polite" className="mb-2 text-sm text-stone-600">
        {!active ? '' : results.length ? `${results.length} ${results.length === 1 ? 'recipe' : 'recipes'}` : 'No recipes match'}
      </p>
      {active ? (
        results.length > 0 && (
          <ul className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white">
            {results.map(r => (
              <li key={r.id}><RecipeLink recipe={r} /></li>
            ))}
          </ul>
        )
      ) : (
        empty
      )}
    </div>
  )
}
