import type { SitePlan, SiteRecipe } from '../types'
import { DinnerList } from './DinnerList'
import { GroceryList } from './GroceryList'
import { PageTitle, SectionTitle } from './Layout'

type Props = {
  plan: SitePlan
  dinners: Record<string, SiteRecipe>
  checked: string[]
  onToggle: (key: string) => void
}

export const PlanView = ({ plan, dinners, checked, onToggle }: Props) => (
  <>
    <PageTitle>{plan.label}</PageTitle>
    <SectionTitle>Dinners</SectionTitle>
    <DinnerList ids={plan.dinners} dinners={dinners} />
    <SectionTitle>Groceries</SectionTitle>
    <GroceryList groups={plan.groceries} checked={checked} onToggle={onToggle} />
  </>
)
