import { label } from '../labels'
import { href } from '../routes'
import type { SiteRecipe } from '../types'

/** Dinner links in the given order. */
export const DinnerList = ({ ids, dinners }: { ids: string[]; dinners: Record<string, SiteRecipe> }) => (
  <ul className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white">
    {ids.map(id => (
      <li key={id}>
        <RecipeLink recipe={dinners[id]!} />
      </li>
    ))}
  </ul>
)

export const RecipeLink = ({ recipe }: { recipe: SiteRecipe }) => (
  <a href={href.recipe(recipe.id)} className="flex min-h-11 flex-col justify-center px-4 py-2 hover:bg-stone-100">
    <span className="font-medium">{recipe.title}</span>
    <span className="text-sm text-stone-600">{label(recipe.method)}</span>
  </a>
)
