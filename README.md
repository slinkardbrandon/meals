# Meals

Family dinner rotation, kid lunch packing, and grocery lists.

- `dinners/*.ts`: one recipe per file, `export default { ... } satisfies Recipe`
- `lunch-items/*.ts`: one item per file, `satisfies LunchItem`
- `src/ingredients.ts`: canonical ingredient registry (aisle, aliases, staple)
- `src/kids.ts`: kids and their quirks
- `src/types.ts`: all types
- `plans/YYYY-Www.md`: weekly plans, also the rotation history

## Commands

```sh
bun install
bun run check   # tsc --noEmit; Bun strips types without checking them
```

CI runs `check` on every PR.
