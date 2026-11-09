import type { GroceryGroup } from '../types'

type Props = { groups: GroceryGroup[]; checked: string[]; onToggle: (key: string) => void }

/** Check-state key; unique even if a line repeats across stores or aisles. */
const lineKey = (store: string | null, aisle: string, line: string) => `${store ?? ''}|${aisle}|${line}`

export const GroceryList = ({ groups, checked, onToggle }: Props) => (
  <div className="space-y-6">
    {groups.map(({ store, aisles }) => (
      <section key={store ?? ''} aria-label={store ?? undefined}>
        {store && <h3 className="mb-2 text-lg font-bold">{store}</h3>}
        <div className="space-y-4">
          {aisles.map(({ aisle, lines }) => (
            <div key={aisle}>
              {store ? (
                <h4 className="mb-1 text-sm font-semibold tracking-wide text-stone-600 uppercase">{aisle}</h4>
              ) : (
                <h3 className="mb-1 text-sm font-semibold tracking-wide text-stone-600 uppercase">{aisle}</h3>
              )}
              <ul className="divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white">
                {lines.map(line => {
                  const key = lineKey(store, aisle, line)
                  const isChecked = checked.includes(key)
                  return (
                    <li key={key}>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 px-4 py-2 select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggle(key)}
                          className="size-5 shrink-0 accent-emerald-800"
                        />
                        {/* stone-600 on white is about 7.5:1, well above 4.5:1. */}
                        <span className={isChecked ? 'text-stone-600 line-through' : ''}>{line}</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
)
