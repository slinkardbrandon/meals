<!--
  Created with spec
  Author: Brandon Slinkard <slinkardbrandon@gmail.com>
-->

# Recipe and Plan Site (GitHub Pages)

> Spec session -- 2026-11-09

## Summary

- A phone-friendly static site, deployed to GitHub Pages, so recipes and grocery lists can be read without opening `.ts` files.
- Home links to the newest plan's grocery list and offers fuzzy recipe search.
- A small React + Tailwind SPA bundled by Bun, living in this repo under `site/`.

## Key Decisions

- **Same repo, deployed as an Actions artifact.** Build reads `dinners/` and `plans/` directly; `_site/` is gitignored; no `gh-pages` branch.
- **React + Tailwind over hand-rolled JS.** Easier for Brandon to restyle and extend; costs a bundle step Bun already provides.
- **Bun bundles everything** (`Bun.build`, HTML entrypoint, `bun-plugin-tailwind`). Bun 1.4.4 is installed and supports both; no Vite, no Tailwind CLI.
- **Generated data is a TS module** at `site/app/data.gen.ts` (gitignored). `bun run check` generates it first, so `tsc` resolves it on a fresh clone and in CI.
- **`buildSiteData` is pure.** It takes loaded dinners and plan file texts; file I/O lives in `site/gen-data.ts`. Tests pass fixtures directly; `loadDinners` stays unchanged.
- **Two tsconfigs.** Root covers `site/*.ts` (Bun side); `site/app/tsconfig.json` covers the browser app (DOM, JSX, no `bun` types).
- **Site types live in `site/app/types.ts`, which has zero imports.** `site/data.ts`, `data.gen.ts`, and components import types only from there. The app never imports `site/data.ts` or anything in `src/` (they pull in `node:fs`).
- **SPA with hash routing.** Pages has no SPA rewrites.
- **Plan pages render the committed plan body**, never recomputed from current recipes. Plan files are the record.
- **Parser supports both plan layouts.** W43-W45 use `### <aisle>` with no store; W46+ use `### <Store>` > `#### <aisle>`. Past plans are never edited.
- **Home = newest plan** (greatest week id) plus recipe search. Shopping happens before the week starts.
- **Plans index** at `#/plans` lists every plan, newest first.
- **Fuzzy search via `fuse.js`.**
- **No persistence.** Grocery check state lives in `App` (in memory), so it survives in-app navigation but not reloads.
- **Wake-lock on recipe pages**, re-requested on `visibilitychange`; silent no-op where unsupported.
- **Dinners only.** Lunch items stay out until plans include lunches.
- **Public site.** The repo is already public; nothing new is exposed.

## Terms Clarified

- **Newest plan**: the plan with the greatest `week` id (e.g. `2026-W46`) on `main`, regardless of today's date.
  _Avoid_: "current week", "this week"
- **Week id**: the metadata `week:` value, format `YYYY-Www`. Routes use it; the UI shows the plan's `label`.

## Data contract

Types go in `site/app/types.ts` (no imports). `site/data.ts` exports `buildSiteData`:

```ts
type SiteIngredient = { text: string; note?: string; optional: boolean }
// { item: 'sour cream', qty: 0.25, unit: 'cup', note: 'for topping', optional: true }
//   -> { text: '0.25 cup sour cream', note: 'for topping', optional: true }
// { item: 'yellow onion', qty: 1 } -> { text: '1 yellow onion', optional: false }
// { item: 'salt', note: 'eyeball it' } -> { text: 'salt', note: 'eyeball it', optional: false }
// qty via formatQty from src/groceries.ts. Staples are included (it's the recipe, not the grocery list).

type SiteRecipe = {
  id: string; title: string; description?: string; kidFriendly: boolean
  protein?: string; method: string; servings?: number; source?: string
  ingredients: SiteIngredient[]; steps: string[]; notes: string[]
}

type GroceryGroup = { store: string | null; aisles: { aisle: string; lines: string[] }[] }
// store is the heading text ('Hy-Vee', 'Target'); null for legacy store-less plans.

type SitePlan = { week: string; starts: string; label: string; dinners: string[]; groceries: GroceryGroup[] }
// label: 'Week of Nov 9', built from the Y-M-D parts of `starts` (never `new Date(starts)`, which shifts a day in Central time).

type SiteData = { dinners: Record<string, SiteRecipe>; plans: SitePlan[] } // plans sorted newest first

buildSiteData(input: { dinners: Record<string, Recipe>; planFiles: string[] }): SiteData
```

- Plan `week`, `starts`, `dinners` come from `parsePlan` (`src/plan-file.ts`), not markdown links.
- Grocery lines are copied verbatim from the body (`- ` prefix stripped).
- Groceries section runs from `## Groceries` to the next `## ` heading or EOF.
- Layout rule: if that section has any `####` heading, `###` is a store and `####` an aisle. Otherwise `###` is an aisle in one group with `store: null`.
- Throws `Plan 2026-W46 references unknown dinner "foo"` when a plan id is missing from `dinners`.
- `site/gen-data.ts` loads `loadDinners()` and every `plans/**/W*.md`, calls `buildSiteData`, writes `site/app/data.gen.ts` as `export default <json> satisfies SiteData`.

## Routes and UI

| Route | View |
| --- | --- |
| `#/` | `<h1>` "Meals". Newest plan card (label, dinner list, "Grocery list" link), then search. Card hidden if zero plans. |
| `#/plans` | All plans, newest first, by label. Zero plans: "No plans yet". |
| `#/plans/<week>` | Dinners in metadata order (links to `#/recipes/<id>`), then grocery list grouped store > aisle (legacy: aisle only). |
| `#/recipes` | Search box over the full alphabetical list; a non-empty query replaces the list with results. |
| `#/recipes/<id>` | Recipe page. |
| anything else, bad week, bad id | "Not found" plus a link home. |

- **Recipe page order:** title; description; meta line (servings, method, protein, "Kid friendly" if true); ingredients `<ul>`; steps `<ol>`; footer with notes and source.
- **Display labels:** method and protein shown via a lookup map (`instant-pot` -> "Instant Pot", `air-fryer` -> "Air fryer", `no-cook` -> "No cook"); others capitalized.
- **Optional ingredients** show a small "optional" tag; notes render after the text in muted style.
- **Grocery rows:** real `<input type="checkbox">` inside a `<label>`; whole row tappable, min 44px tall; checked rows strike through and dim, keeping text contrast at least 4.5:1.
- **Check state:** `App` holds `Record<week, string[]>`; toggles replace the array (never mutate), so React re-renders.
- **Search:** `<input type="search" autocapitalize="off" enterkeyhint="search">`; no debounce (31 items); top 8 results, each showing title and method. Empty query shows nothing on Home. No hits shows "No recipes match". Result count / no-hits text sits in an `aria-live="polite"` region.
- **Navigation:** on hash change, set `document.title` to `<page> - Meals` and focus the page `<h1>` (`tabIndex={-1}`); skip focus on first load. `App` saves `scrollY` per hash when leaving; revisiting a hash restores it, a new hash scrolls to top. Back from a recipe returns to the same spot in the grocery list.
- **Text:** base 18px body on recipe pages for reading at counter distance.

## Test Cases

- `buildSiteData` sorts plans newest first across years (`2027-W01` before `2026-W52`).
- Parses W46-layout groceries into `Hy-Vee` and `Target` groups whose lines match the file verbatim.
- Parses W43-layout groceries into one group with `store: null`.
- Takes plan dinner ids from metadata, not markdown links.
- Builds `label` "Week of Nov 9" from `starts: 2026-11-09` under `TZ=America/Chicago`.
- Throws a message naming the plan and id when a plan references an unknown dinner.
- Includes every dinner passed in, keyed by id.
- Formats ingredients per the data contract examples, including optional and note.
- Real repo data: `buildSiteData` over actual `dinners/` and `plans/` succeeds (smoke test).
- Search: "chilli" puts Costco Style Chili in the top 3; "spag" puts Dual-Sauce Cheesy Spaghetti Bake in the top 3.
- Build: `_site/index.html` contains no `src="/` or `href="/` (paths are relative for `/meals/`).

## Implementation Plan

### Approach

1. Write `buildSiteData` and its tests against fixtures, then the generator.
2. Split tsconfigs and wire `check` to generate data first.
3. Build the React app: router, layout, home, plans, recipes, search, grocery list.
4. Bundle with `Bun.build` into `_site/` with relative asset paths.
5. Add the Pages workflow and docs.

### Files to touch

- `site/app/types.ts`: the `Site*` types from the data contract; zero imports.
- `site/data.ts`: pure `buildSiteData` per the data contract. Reuse `parsePlan`, `formatQty`.
- `site/data.test.ts`: data test cases, inline fixture strings for W43 and W46 layouts.
- `site/gen-data.ts`: exports `loadSiteData()` (`loadDinners` + plan glob + `buildSiteData`) and `writeSiteData()`; runs `writeSiteData()` under `import.meta.main`. Writes `site/app/data.gen.ts`.
- `site/build.ts`: exports `build(outdir)`: calls `writeSiteData()`, then `Bun.build({ entrypoints: ['site/index.html'], outdir, publicPath: './', plugins: [tailwind], minify: true })`. Runs `build('_site')` under `import.meta.main`.
- `site/build.test.ts`: calls `build(<temp dir>)`; asserts `index.html` has no `src="/` or `href="/`.
- `site/index.html`: entrypoint; links `./styles.css`, loads `./app/main.tsx`.
- `site/styles.css`: `@import "tailwindcss";`.
- `site/app/main.tsx`, `App.tsx`: `useHashRoute` hook over `hashchange`; route table above; check state.
- `site/app/components/`: `Layout`, `Home`, `PlansIndex`, `PlanView`, `GroceryList`, `RecipesIndex`, `RecipeView`, `RecipeSearch`, `NotFound`; `useWakeLock` hook.
- `site/app/search.ts`: Fuse over `title` (weight 3), `description`, `protein`, `method`, ingredient `text`; `threshold: 0.4`. Pure, no DOM.
- `site/search.test.ts`: search cases against real data via `loadSiteData()`.
- `site/app/tsconfig.json`: `"extends": "../../tsconfig.json"`, overriding `lib: ["ESNext", "DOM", "DOM.Iterable"]`, `jsx: "react-jsx"`, `types: []`, `include: ["."]` (resolved relative to this file).
- `tsconfig.json`: add `"site/*.ts"` to `include`.
- `package.json`: scripts `"check": "bun site/gen-data.ts && tsc --noEmit && tsc -p site/app --noEmit"`, `"site": "bun site/build.ts"`; deps `react`, `react-dom`, `fuse.js`; devDeps `@types/react`, `@types/react-dom`, `tailwindcss`, `bun-plugin-tailwind`.
- `.github/workflows/pages.yml`: see below.
- `.gitignore`: `_site/`, `site/app/data.gen.ts`.
- `AGENTS.md`, `README.md`: site location, `bun run site`, local preview, and that the site reads plan bodies as-is.

### Pages workflow

```yaml
name: pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.4.4
      - run: bun install --frozen-lockfile
      - run: bun run site
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- No check/test here: `check.yml` already gates `main`. `check.yml` needs no change, since `check` now generates data itself.

### How to verify

- `bun run check`, `bun run test`, `bun run site` pass.
- Subpath preview: `mkdir -p /tmp/pages && ln -sfn "$PWD/_site" /tmp/pages/meals && bunx serve /tmp/pages`, then open `http://localhost:3000/meals/` at phone width.
- Walk: home > plan > recipe > back; checks persist. Open a W43 plan; groceries render without stores. Visit `#/recipes/nope`; see Not found.
- After merge: one-time setting Settings > Pages > Source: GitHub Actions; confirm the deployed URL loads.
