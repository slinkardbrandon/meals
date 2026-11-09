import type { ReactNode } from 'react'
import { href } from '../routes'

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-dvh bg-stone-50 text-stone-900 antialiased">
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/95 backdrop-blur">
      <nav className="mx-auto flex max-w-2xl items-center gap-1 px-4 py-2" aria-label="Main">
        <a href={href.home} className="mr-auto min-h-11 content-center rounded px-2 text-lg font-bold tracking-tight">
          Meals
        </a>
        <a href={href.plans} className="min-h-11 content-center rounded px-3 font-medium text-stone-700 hover:bg-stone-200">
          Plans
        </a>
        <a href={href.recipes} className="min-h-11 content-center rounded px-3 font-medium text-stone-700 hover:bg-stone-200">
          Recipes
        </a>
      </nav>
    </header>
    <main className="mx-auto max-w-2xl px-4 pt-6 pb-16">{children}</main>
  </div>
)

export const PageTitle = ({ children }: { children: ReactNode }) => (
  <h1 tabIndex={-1} className="mb-4 text-3xl font-bold tracking-tight outline-none">
    {children}
  </h1>
)

export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="mt-8 mb-3 text-xl font-semibold">{children}</h2>
)
