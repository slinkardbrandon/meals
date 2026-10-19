# Agent guide

Family meal planning data, typed in TS and run with Bun. Types live in `src/types.ts`.

Run `bun run check` after every change. Bun does not type-check on its own.

Never commit to `main`. Every change goes on a branch and merges through a PR.

## Adding or editing a dinner

- Check `dinners/` for an existing match before creating a file. Variants of the same dish get one file.
- Filename is the kebab-case title: `Chicken Caesar Salad` -> `chicken-caesar-salad.ts`.
- When converting a source recipe, put our changes to it in `notes`. Never silently rewrite the source's quantities.
- We never use cilantro. Drop it from any source recipe and say so in `notes`.
- Don't guess `kidFriendly`. If the user hasn't said, ask. The kids are picky.

## Ingredients

The grocery list merges ingredients across meals by `item`, so every item must exist in `src/ingredients.ts`.

- Search the registry, including `aliases`, before adding an entry.
- New entries: generic, lowercase, singular (`yellow onion`, `garlic`). Keep a brand only when it matters to us (`Prego meat sauce`).
- Fractions go in `qty`, not `unit`: 1/4 cup is `{ qty: 0.25, unit: 'cup' }`. Add to `Unit` only for a genuinely new unit.
- List pantry staples too, and mark them `staple: true` in the registry.

## Lunch items

- Record only preferences the user stated. A kid missing from `kids` means they won't eat it.

## Plans

- `plans/YYYY/Www.md` files are history (`YYYY` is the ISO week-year). Never edit past weeks; the rotation logic depends on them.
- Change plans through `bun main.ts` (`plan`, `drop`, `add`, `groceries`), not by hand. The body is regenerated from the `<!-- -->` metadata block at the top, which GitHub hides.
- Mark ingredients the grocery list should skip with `optional: true`, not a note.
- The weekly routine follows `routine/weekly-plan.md`; keep it in sync with the CLI.
