# Meals

Family dinner rotation, kid lunch packing, and grocery lists.

- `dinners/*.ts`: one recipe per file, `export default { ... } satisfies Recipe`
- `lunch-items/*.ts`: one item per file, `satisfies LunchItem`
- `src/ingredients.ts`: canonical ingredient registry (aisle, aliases, staple)
- `src/kids.ts`: kids and their quirks
- `src/types.ts`: all types
- `plans/YYYY/Www.md`: weekly plans, also the rotation history (`YYYY` is the ISO week-year)
- `main.ts`: the planner CLI
- `routine/weekly-plan.md`: prompt for the weekly cloud routine

## Commands

```sh
bun install
bun run check   # tsc --noEmit; Bun strips types without checking them
bun run test    # TZ=America/Chicago bun test
```

CI runs `check` and `test` on every PR.

## Planning a week

Every command takes `--week YYYY-Www` and defaults to next ISO week (America/Chicago). Weeks before the current one are refused.

```sh
bun main.ts plan [--count 5] [--seed S] [--exclude id ...] [--force]
bun main.ts drop <id>                          # move a dinner to dropped
bun main.ts add [--method M] [--protein P] [--id id]
bun main.ts groceries                          # regenerate the body after hand edits
bun main.ts week [--offset N]                  # print the week id N weeks out (default 1)
```

- Rotation: a dinner planned 1 week away (either direction) is excluded; 2 weeks away gets 1/4 weight.
- Variety: weight halves per already-picked dinner sharing protein, and per one sharing method.
- Picks are seeded (default seed is the week id), so reruns are reproducible.
- Swap is `drop` then `add`. Random `add` skips anything in `dropped`; `add --id` can undo a drop.
- The plan file's `<!-- -->` metadata block is the source of truth (hidden on GitHub); the body is regenerated on every write.

A weekly cloud routine runs this and opens a draft PR on `plan/YYYY-Www`. Reply in its session with swaps, then "go" to auto-merge. See `routine/weekly-plan.md`.
