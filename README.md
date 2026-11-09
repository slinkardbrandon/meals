# Meals

Family dinner rotation, kid lunch packing, and grocery lists.

- `dinners/*.ts`: one recipe per file, `export default { ... } satisfies Recipe`
- `lunch-items/*.ts`: one item per file, `satisfies LunchItem`
- `src/ingredients.ts`: canonical ingredient registry (aisle, aliases, staple, stores)
- `src/kids.ts`: kids and their quirks
- `src/types.ts`: all types
- `plans/YYYY/Www.md`: weekly plans, also the rotation history (`YYYY` is the ISO week-year)
- `main.ts`: the planner CLI
- `routine/weekly-plan.md`: prompt for the weekly cloud routine
- `.claude/skills/fill-carts/`: skill that fills the store carts from a plan (never checks out)
- `site/`: phone-friendly recipe and grocery site (React + Tailwind, bundled by Bun), deployed to GitHub Pages

## Commands

```sh
bun install
bun run check   # generates site data, then tsc; Bun strips types without checking them
bun run test    # TZ=America/Chicago bun test
bun run site    # builds the site into _site/
```

CI runs `check` and `test` on every PR.

## Site

`bun run site` builds a static SPA into `_site/`. The `pages` workflow deploys it on every push to `main`; Pages source must be set to GitHub Actions (one-time, in repo settings).

- Plan pages show each plan file's committed grocery list as-is; they never recompute from current recipes.
- Data is generated into `site/app/data.gen.ts` (gitignored) by `bun site/gen-data.ts`; `check` runs it first.
- Paths are relative, so it works under `/meals/`. Preview at that subpath:

```sh
bun run site
mkdir -p /tmp/pages && ln -sfn "$PWD/_site" /tmp/pages/meals && bunx serve /tmp/pages
# open http://localhost:3000/meals/
```

## Planning a week

Every command takes `--week YYYY-Www` and defaults to next ISO week (America/Chicago). Weeks before the current one are refused.

```sh
bun main.ts plan [--count 5] [--seed S] [--exclude id ...] [--force]
bun main.ts drop <id>                          # move a dinner to dropped
bun main.ts add [--method M] [--protein P] [--id id]
bun main.ts groceries                          # regenerate the body after hand edits
bun main.ts week [--offset N]                  # print the week id N weeks out (default 1)
bun main.ts carts [--fresh|--decide|--report]  # cart run files under .carts/runs/<week>/
```

- Rotation: a dinner planned 1 week away (either direction) is excluded; 2 weeks away gets 1/4 weight.
- Variety: weight halves per already-picked dinner sharing protein, and per one sharing method.
- Picks are seeded (default seed is the week id), so reruns are reproducible.
- Swap is `drop` then `add`. Random `add` skips anything in `dropped`; `add --id` can undo a drop.
- The plan file's `<!-- -->` metadata block is the source of truth (hidden on GitHub); the body is regenerated on every write.

A weekly cloud routine runs this and opens a draft PR on `plan/YYYY-Www`. Reply in its session with swaps, then "go" to auto-merge. See `routine/weekly-plan.md`.
