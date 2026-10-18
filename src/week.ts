// ISO 8601 weeks. Ids look like `2026-W43`, where the year is the ISO week-year.
// Math runs in UTC on calendar dates so DST never shifts a day.

const DAY = 86_400_000
const WEEK = 7 * DAY

const pad = (n: number, width = 2) => String(n).padStart(width, '0')

/** UTC midnight of the Monday that starts ISO week 1 of `year`. */
const week1Monday = (year: number) => {
  const jan4 = Date.UTC(year, 0, 4)
  return jan4 - ((new Date(jan4).getUTCDay() + 6) % 7) * DAY
}

const fromUtc = (ms: number) => {
  const d = new Date(ms)
  // The Thursday of this week decides the week-year.
  const thursday = ms + (3 - ((d.getUTCDay() + 6) % 7)) * DAY
  const year = new Date(thursday).getUTCFullYear()
  const week = 1 + Math.floor((thursday - week1Monday(year)) / WEEK)
  return `${year}-W${pad(week)}`
}

/** UTC midnight of the Monday that starts `id`. Throws on malformed or nonexistent weeks. */
const monday = (id: string) => {
  const match = /^(\d{4})-W(\d{2})$/.exec(id)
  if (!match) throw new Error(`Bad week id "${id}"; expected YYYY-Www`)
  const ms = week1Monday(Number(match[1])) + (Number(match[2]) - 1) * WEEK
  if (fromUtc(ms) !== id) throw new Error(`Week ${id} does not exist`)
  return ms
}

/** The week containing `date`'s local calendar day. */
export const weekId = (date: Date) => fromUtc(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

export const addWeeks = (id: string, n: number) => fromUtc(monday(id) + n * WEEK)

export const nextWeek = (id: string) => addWeeks(id, 1)

/** Signed weeks from `a` to `b`. */
export const weekDiff = (a: string, b: string) => Math.round((monday(b) - monday(a)) / WEEK)

export const weekDistance = (a: string, b: string) => Math.abs(weekDiff(a, b))

/** The Monday of `id` as `YYYY-MM-DD`. */
export const weekStart = (id: string) => new Date(monday(id)).toISOString().slice(0, 10)

export const planPath = (id: string) => {
  monday(id)
  const [year, week] = id.split('-')
  return `plans/${year}/${week}.md`
}
