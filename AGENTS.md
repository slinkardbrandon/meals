# Agent guide

Family meal planning data. Schemas live in `README.md`; this file covers how to change things.

## Adding or editing a dinner

- Check `dinners/` for an existing match before creating a file. Variants of the same dish get one file.
- Filename is the kebab-case name: `Chicken Caesar Salad` -> `chicken-caesar-salad.md`.
- Ingredients go in frontmatter only, never in the body.
- When converting a source recipe, put our changes to it in `## Notes`. Never silently rewrite the source's quantities.
- Don't guess `kid_friendly`. If the user hasn't said, ask. The kids are picky.

## Ingredient names

The grocery list merges ingredients across meals by `item`, so names must be consistent.

- Use the generic, lowercase, singular name: `ground beef`, `yellow onion`, `garlic clove`.
- Reuse an existing name before inventing one: `grep -rh "item:" dinners/ lunch-items/`.
- Keep a brand only when it matters to us: `Prego meat sauce`, `Classico Alfredo`.
- Units: `lb`, `oz`, `cup`, `tbsp`, `tsp`, `can`, `jar`, `pkg`, or omit for counts.
- Pantry staples (salt, pepper, oil) still get listed so the planner can skip them deliberately.

## Lunch items

- Mark only preferences the user stated. A kid missing from `kids` means they won't eat it.
- Kid names in `kids` must match keys in `kids.yml`.

## Plans

- `plans/YYYY-Www.md` files are history. Never edit past weeks; the rotation logic depends on them.
