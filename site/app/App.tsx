import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Home } from './components/Home'
import { Layout } from './components/Layout'
import { NotFound } from './components/NotFound'
import { PlansIndex } from './components/PlansIndex'
import { PlanView } from './components/PlanView'
import { RecipesIndex } from './components/RecipesIndex'
import { RecipeView } from './components/RecipeView'
import data from './data.gen'
import { parseRoute } from './routes'
import { createSearch } from './search'
import type { SiteData } from './types'

const site: SiteData = data
const search = createSearch(Object.values(site.dinners))
const alphabetical = Object.values(site.dinners).sort((a, b) => a.title.localeCompare(b.title))

const currentHash = () => location.hash || '#/'

/** Tracks `location.hash`, saving scroll per hash on leave and restoring it on return. */
const useHashRoute = () => {
  const [hash, setHash] = useState(currentHash)
  const current = useRef(hash)
  const positions = useRef(new Map<string, number>())

  useEffect(() => {
    history.scrollRestoration = 'manual'
    const onChange = () => {
      positions.current.set(current.current, window.scrollY)
      current.current = currentHash()
      setHash(current.current)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  useLayoutEffect(() => {
    window.scrollTo(0, positions.current.get(hash) ?? 0)
  }, [hash])

  return hash
}

type Page = { title: string; view: ReactNode }

export const App = () => {
  const hash = useHashRoute()
  const [checks, setChecks] = useState<Record<string, string[]>>({})

  const toggle = useCallback((week: string, key: string) => {
    setChecks(prev => {
      const list = prev[week] ?? []
      return { ...prev, [week]: list.includes(key) ? list.filter(k => k !== key) : [...list, key] }
    })
  }, [])

  const route = parseRoute(hash)
  const notFound: Page = { title: 'Not found', view: <NotFound /> }
  const page: Page = (() => {
    switch (route.name) {
      case 'home':
        return { title: 'Meals', view: <Home plan={site.plans[0]} dinners={site.dinners} search={search} /> }
      case 'plans':
        return { title: 'Plans', view: <PlansIndex plans={site.plans} /> }
      case 'plan': {
        const plan = site.plans.find(p => p.week === route.week)
        if (!plan) return notFound
        return {
          title: plan.label,
          view: (
            <PlanView
              plan={plan}
              dinners={site.dinners}
              checked={checks[plan.week] ?? []}
              onToggle={key => toggle(plan.week, key)}
            />
          ),
        }
      }
      case 'recipes':
        return { title: 'Recipes', view: <RecipesIndex recipes={alphabetical} search={search} /> }
      case 'recipe': {
        const recipe = site.dinners[route.id]
        return recipe ? { title: recipe.title, view: <RecipeView recipe={recipe} /> } : notFound
      }
      case 'notFound':
        return notFound
    }
  })()

  // Title and focus follow navigation; focus skips first load so the page doesn't jump.
  const firstLoad = useRef(true)
  useEffect(() => {
    document.title = page.title === 'Meals' ? 'Meals' : `${page.title} - Meals`
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
  }, [hash, page.title])

  return <Layout>{page.view}</Layout>
}
