import type { SiteRecipe } from '../types'
import { RecipeLink } from './DinnerList'
import { PageTitle } from './Layout'
import { RecipeSearch } from './RecipeSearch'

type Props = { recipes: SiteRecipe[]; search: (query: string) => SiteRecipe[] }

export const RecipesIndex = ({ recipes, search }: Props) => (
  <>
    <PageTitle>Recipes</PageTitle>
    <RecipeSearch
      search={search}
      empty={
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white">
          {recipes.map(r => (
            <li key={r.id}><RecipeLink recipe={r} /></li>
          ))}
        </ul>
      }
    />
  </>
)
