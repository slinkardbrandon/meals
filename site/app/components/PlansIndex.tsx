import { href } from '../routes'
import type { SitePlan } from '../types'
import { PageTitle } from './Layout'

export const PlansIndex = ({ plans }: { plans: SitePlan[] }) => (
  <>
    <PageTitle>Plans</PageTitle>
    {plans.length === 0 ? (
      <p className="text-stone-600">No plans yet</p>
    ) : (
      <ul className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white">
        {plans.map(plan => (
          <li key={plan.week}>
            <a href={href.plan(plan.week)} className="flex min-h-11 items-center justify-between px-4 py-2 hover:bg-stone-100">
              <span className="font-medium">{plan.label}</span>
              <span className="text-sm text-stone-600">{plan.dinners.length} dinners</span>
            </a>
          </li>
        ))}
      </ul>
    )}
  </>
)
