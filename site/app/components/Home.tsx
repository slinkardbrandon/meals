import { href } from '../routes'
import type { SitePlan, SiteRecipe } from '../types'
import { DinnerList } from './DinnerList'
import { PageTitle, SectionTitle } from './Layout'
import { RecipeSearch } from './RecipeSearch'

type Props = {
  plan: SitePlan | undefined
  dinners: Record<string, SiteRecipe>
  search: (query: string) => SiteRecipe[]
}

export const Home = ({ plan, dinners, search }: Props) => (
  <>
    <PageTitle>Meals</PageTitle>
    {plan && (
      <section aria-labelledby="newest-plan" className="mb-8">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 id="newest-plan" className="text-xl font-semibold">
            <a href={href.plan(plan.week)} className="hover:underline">{plan.label}</a>
          </h2>
          <a
            href={href.plan(plan.week)}
            className="min-h-11 content-center rounded-lg bg-emerald-800 px-4 font-medium text-white hover:bg-emerald-900"
          >
            Grocery list
          </a>
        </div>
        <DinnerList ids={plan.dinners} dinners={dinners} />
      </section>
    )}
    <SectionTitle>Find a recipe</SectionTitle>
    <RecipeSearch search={search} />
  </>
)
