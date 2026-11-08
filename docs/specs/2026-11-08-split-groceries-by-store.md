<!--
  Created with spec
  Author: Brandon Slinkard <slinkardbrandon@gmail.com>
-->

# Split Grocery List by Store

> Spec session -- 2026-11-08

## Summary

- The weekly grocery list splits into Hy-Vee and Target sections, with aisle groups nested under each store.
- Hy-Vee is best for meat and produce; Target is cheaper for packaged goods.
- Store comes from a per-aisle default, with an optional per-ingredient override.

## Key Decisions

- Each aisle has a default store; an ingredient may override it with `store`. Avoids tagging every registry entry.
- Default map: `produce`, `meat`, `deli` -> `hyvee`; `dairy`, `bakery`, `pantry`, `frozen`, `spices` -> `target`. Deli is counter-fresh; dairy and bakery here are packaged.
- One store per item. The merge already combines an item across dinners, so no item is split between stores.
- Store order follows `STORES` (`hyvee`, then `target`); aisle order inside a store follows `AISLES`; items sort as today.
- Empty stores and empty aisles are omitted, matching current empty-aisle behavior.
- An item missing from the registry is skipped silently, as today (keep the `?.` access).
- `store` is only the routing override. Product ids for cart automation: out of scope, separate field later.
- Regenerate `plans/2026/W46.md` in this PR. It must land before W46 ends (2026-11-15); after that `main.ts` refuses with "past plans are history", so drop the regen step instead.
- Leave W43 through W45 untouched. W43 and W44 are past (AGENTS.md rule); W45 is current but already shopped.

## Output Layout

Exact bytes. `##` and `###` headings are followed by one blank line. Aisle blocks within a store, and store blocks, are separated by one blank line. Items sit directly under their `####` heading. File ends with a single `\n`.

Zero non-staple items keeps today's output: `## Groceries\n\n\n`.

```markdown
## Groceries

### Hy-Vee

#### produce
- mushrooms: 1 lb (sliced)

#### meat
- ground beef: 3 lb

### Target

#### dairy
- sour cream: 1 cup

#### pantry
- Prego meat sauce: 1 jar
```

- Store heading text comes from `STORE_NAMES`: `Hy-Vee`, `Target`.
- Aisle heading text is the raw aisle id, as today.

## Terms Clarified

- **store**: The retailer an item is bought from (`hyvee` or `target`). Display names: `Hy-Vee`, `Target`.
  _Avoid_: "variant", "source" (`source` already means a recipe URL on `Recipe`)
- **aisle default**: The store an aisle maps to when an ingredient has no `store` override.

## Test Cases

`src/groceries.test.ts`:

- routes by aisle default: fixture dinner with `{ item: 'ground beef', qty: 1, unit: 'lb' }` and `{ item: 'Prego meat sauce', qty: 1, unit: 'jar' }` yields `[{ store: 'hyvee', aisles: [{ aisle: 'meat', lines: ['ground beef: 1 lb'] }] }, { store: 'target', aisles: [{ aisle: 'pantry', lines: ['Prego meat sauce: 1 jar'] }] }]`
- store override beats aisle default: pass a custom registry (second arg to `mergeGroceries`) where a `pantry` item has `store: 'hyvee'`; it appears under `hyvee` -> `pantry`. Do not add a real override to `src/ingredients.ts`.
- one group per store even when aisles interleave: `mushrooms` (produce), `ground beef` (meat), `sour cream` (dairy), `pepperoni` (deli) yields exactly two groups; `hyvee` aisles are `produce, meat, deli`, `target` is `dairy`. `AISLES` puts dairy between meat and deli, so a "new group on store change" walk fails this.
- omits a store with no items (only Target items -> one group)
- skips an item missing from the registry without throwing: pass a custom registry (second arg) that omits a real item the recipe uses. No casts.
- existing staple, merging, and optional tests pass unchanged once the `lines` helper flattens two levels

`src/plan-file.test.ts`:

- the "renders hidden metadata, dinners, and groceries" expected body becomes `## Groceries\n\n### Hy-Vee\n\n#### produce\n- mushrooms: 1 lb (sliced)\n` (stroganoff's `mushrooms` is `produce`)
- renders two stores with two aisles each: assert `text.slice(text.indexOf('## Groceries'))` `toBe` the Output Layout block (fixture items as shown there)

`src/main.test.ts`:

- groceries rewrites an old-format plan: build the prefix with `serializePlan` for `{ week: '2026-W43', starts: '2026-10-19', seed: '2026-W43', dinners: ['stroganoff'], dropped: [] }` and the real recipes, cut at `## Groceries`, then append `## Groceries\n\n### produce\n- mushrooms: 2 lb (sliced)\n`. Write it to `plans/2026/W43.md`, run `cli('groceries', '--week', '2026-W43')`. Assert the text before `## Groceries` is byte-equal, the body contains `### Hy-Vee`, and `/^### produce$/m` no longer matches. (Real `stroganoff` has ground beef and mushrooms, so Hy-Vee is non-empty.)

## Implementation Plan

### Approach

1. Add a `Store` type, store display names, and an aisle-to-store default map.
2. Add an optional `store` override to `IngredientInfo`.
3. Change `mergeGroceries` to group by store, then aisle.
4. Render the store and aisle headings in `serializePlan` per Output Layout.
5. Regenerate W46 and update `AGENTS.md`.

### Files to touch

- `src/types.ts`: add `STORES = ['hyvee', 'target'] as const`, `Store`, `STORE_NAMES: Record<Store, string>`, `AISLE_STORE: Record<Aisle, Store>` with the map above, and `store?: Store` on `IngredientInfo` (doc comment: overrides the aisle default).
- `src/groceries.ts`: export `StoreGroup = { store: Store; aisles: AisleGroup[] }`. `mergeGroceries` returns `StoreGroup[]`. Resolve store as `info.store ?? AISLE_STORE[info.aisle]` where `info = registry[item]`; skip when `info` is undefined. Tally logic unchanged.
- `src/plan-file.ts`: `serializePlan` renders per Output Layout.
- `src/groceries.test.ts`: change the `lines` helper to `mergeGroceries(...).flatMap(s => s.aisles).flatMap(a => a.lines)`; rewrite the "groups by aisle" test to the store shape; add the cases above.
- `src/plan-file.test.ts`: update the exact-body expectation; add the two-store layout case.
- `src/main.test.ts`: add the old-format upgrade case.
- `plans/2026/W46.md`: regenerate via `bun main.ts groceries --week 2026-W46`. Never hand-edit.
- `AGENTS.md` (Ingredients section): one bullet: store comes from `AISLE_STORE` in `src/types.ts`; set `store` on an entry only for exceptions.
- `README.md:7`: registry description becomes `(aisle, aliases, staple, store)`.

### How to verify

- `bun run check && bun run test` pass.
- `git diff plans/2026/W46.md` touches only lines under `## Groceries`.
- `grep -n '^###' plans/2026/W46.md` shows `### Hy-Vee` before `### Target`.
- W46 has `chicken breast` and `ground beef` under `### Hy-Vee` -> `#### meat`, `pepperoni` under `### Hy-Vee` -> `#### deli`, and `Prego meat sauce` and `Classico Alfredo` under `### Target` -> `#### pantry`.

### Assumptions

- Lunch items stay off the grocery list (they are not on it today).
- No `store` overrides are added to `src/ingredients.ts` in this change.
- Old plan files keep their aisle-only bodies. `parsePlan` and `readHistory` read only the metadata block, so mixed formats are safe; do not migrate them or add body parsing.
- `routine/weekly-plan.md` needs no change: the CLI commands are unchanged.
