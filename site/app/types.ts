// Site data types. Zero imports: the browser app and the Bun side both use these.

export type SiteIngredient = { text: string; note?: string; optional: boolean }

export type SiteRecipe = {
  id: string
  title: string
  description?: string
  kidFriendly: boolean
  protein?: string
  method: string
  servings?: number
  source?: string
  ingredients: SiteIngredient[]
  steps: string[]
  notes: string[]
}

/** `store` is the heading text ('Hy-Vee', 'Target'); null for legacy store-less plans. */
export type GroceryGroup = { store: string | null; aisles: { aisle: string; lines: string[] }[] }

export type SitePlan = { week: string; starts: string; label: string; dinners: string[]; groceries: GroceryGroup[] }

/** `plans` are sorted newest first. */
export type SiteData = { dinners: Record<string, SiteRecipe>; plans: SitePlan[] }
