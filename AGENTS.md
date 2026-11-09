# Agent guide

Family meal planning data, typed in TS and run with Bun. Types live in `src/types.ts`.

Needs Bun 1.4+. `bun.lock` is lockfile v2; older Bun ignores it and `--frozen-lockfile` fails.

Run `bun run check` and `bun run test` after every change. Bun does not type-check on its own. CI runs both.

Never commit to `main`. Every change goes on a branch (`claude/<topic>`; plans use `plan/YYYY-Www`) and merges through a PR.

`docs/specs/` holds dated design specs. They record decisions at the time; the code and this file win when they disagree.

## Adding or editing a dinner

- Check `dinners/` for an existing match before creating a file. Variants of the same dish get one file.
- Filename is the kebab-case title: `Chicken Caesar Salad` -> `chicken-caesar-salad.ts`. The filename without `.ts` is the dinner id the CLI and plan files use.
- Never rename or delete a dinner that appears in a `plans/` file. Past plans reference it by id.
- When converting a source recipe, put our changes to it in `notes`. Never silently rewrite the source's quantities.
- We never use cilantro. Drop it from any source recipe and say so in `notes`.
- Don't guess `kidFriendly`. If the user hasn't said, ask. The kids are picky.

## Ingredients

The grocery list merges ingredients across meals by `item`, so every item must exist in `src/ingredients.ts`.

- Search the registry, including `aliases`, before adding an entry.
- New entries: generic, lowercase, singular (`yellow onion`, `garlic`). Keep a brand only when it matters to us (`Prego meat sauce`).
- Fractions go in `qty`, not `unit`: 1/4 cup is `{ qty: 0.25, unit: 'cup' }`. Add to `Unit` only for a genuinely new unit.
- List pantry staples too, and mark them `staple: true` in the registry.
- Allowed stores come from `AISLE_STORES` in `src/types.ts`. Set `stores` on an entry only for exceptions.
- `stores` is ordered: the first is the default and the tiebreaker. One entry locks the item there; `[]` means never carted.
- Produce, meat, and deli are locked to Hy-Vee for quality. Don't add a fallback store.

## Lunch items

- Kids live in `src/kids.ts`.
- Record only preferences the user stated. A kid missing from `kids` means they won't eat it.

## Plans

- `plans/YYYY/Www.md` files are history (`YYYY` is the ISO week-year). Never edit past weeks; the rotation logic depends on them.
- Change plans through `bun main.ts` (`plan`, `drop`, `add`, `groceries`, `week`), not by hand. The body is regenerated from the `<!-- -->` metadata block at the top, which GitHub hides.
- Recipe edits change the grocery body. After updating a plan branch from `main`, rerun `groceries --week <id>` and commit if the file changed.
- Default to required. Use `optional: true` only when the user says we often make the dish without it; if we always have it, mark it `staple` in the registry instead. The grocery list still includes optional items, flagged `(optional)`.
- The weekly routine follows `routine/weekly-plan.md`; keep it in sync with the CLI.

## Site

- `site/` is a React + Tailwind SPA bundled by Bun (`bun run site` -> `_site/`), deployed to GitHub Pages by `.github/workflows/pages.yml`.
- Plan pages render each plan's committed grocery body as-is. The parser handles both layouts (`### aisle` for W43-W45, `### Store` > `#### aisle` after).
- `site/app/` is browser code with its own tsconfig. It imports types only from `site/app/types.ts` and never imports `src/` or `site/*.ts` (they pull in `node:fs`).
- `site/app/data.gen.ts` and `_site/` are generated and gitignored. `bun run check` regenerates the data first.

## Carts

- `.claude/skills/fill-carts/` loads a week's groceries into the Hy-Vee and Target carts. It never checks out.
- `bun main.ts carts` owns routing, price decisions, validation, and the report. Agents only match, quote, and click.
- `.carts/` is gitignored: run files, product caches, private store notes. Never commit it; the repo is public.
- Run it supervised. Don't drive the live store sites unattended.
