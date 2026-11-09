import { label } from '../labels'
import type { SiteRecipe } from '../types'
import { PageTitle, SectionTitle } from './Layout'
import { useWakeLock } from './useWakeLock'

/** Links a leading URL; keeps any trailing text, e.g. 'https://... (406_bbq)'. */
const Source = ({ text }: { text: string }) => {
  const match = /^(https?:\/\/\S+)(.*)$/.exec(text)
  const url = match && URL.canParse(match[1]!) ? new URL(match[1]!) : undefined
  if (!url) return <>{text}</>
  return (
    <>
      <a href={url.href} className="text-emerald-800 underline underline-offset-2" rel="noreferrer">
        {url.hostname.replace(/^www\./, '')}
      </a>
      {match![2]}
    </>
  )
}

export const RecipeView = ({ recipe }: { recipe: SiteRecipe }) => {
  useWakeLock()
  const meta = [
    recipe.servings ? `Serves ${recipe.servings}` : undefined,
    label(recipe.method),
    recipe.protein ? label(recipe.protein) : undefined,
    recipe.kidFriendly ? 'Kid friendly' : undefined,
  ].filter(Boolean)

  return (
    <article className="text-lg leading-relaxed">
      <PageTitle>{recipe.title}</PageTitle>
      {recipe.description && <p className="mb-3 text-stone-700">{recipe.description}</p>}
      <p className="text-base text-stone-600">{meta.join(' · ')}</p>

      <SectionTitle>Ingredients</SectionTitle>
      <ul className="space-y-1.5">
        {recipe.ingredients.map((ing, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="text-stone-400">•</span>
            <span>
              {ing.text}
              {ing.note && <span className="text-stone-600">, {ing.note}</span>}
              {ing.optional && (
                <span className="ml-2 rounded bg-stone-200 px-1.5 py-0.5 align-middle text-xs font-medium text-stone-700">
                  optional
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <SectionTitle>Steps</SectionTitle>
      <ol className="list-decimal space-y-3 pl-6 marker:font-semibold marker:text-stone-500">
        {recipe.steps.map((step, i) => <li key={i} className="pl-1">{step}</li>)}
      </ol>

      {(recipe.notes.length > 0 || recipe.source) && (
        <footer className="mt-10 border-t border-stone-200 pt-4 text-base text-stone-700">
          {recipe.notes.length > 0 && (
            <>
              <h2 className="mb-2 font-semibold text-stone-900">Notes</h2>
              <ul className="mb-4 list-disc space-y-1 pl-5">
                {recipe.notes.map((note, i) => <li key={i}>{note}</li>)}
              </ul>
            </>
          )}
          {recipe.source && <p className="break-words">Source: <Source text={recipe.source} /></p>}
        </footer>
      )}
    </article>
  )
}
