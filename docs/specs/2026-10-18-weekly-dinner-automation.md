<!--
  Created with spec
  Author: Brandon Slinkard <slinkardbrandon@gmail.com>
-->

# Weekly dinner automation

> Spec session -- 2026-10-18

## Summary

- Build a seeded rotation planner and a deterministic grocery merge, driven by a weekly Claude cloud routine.
- The routine proposes a plan in a draft PR and waits in its session for swaps. On "go" it enables auto-merge; the merge is the commit.
- Lunch planning is out of scope until lunch item data exists.

## Key Decisions

- **Script first, LLM second.** Scripts do everything deterministic; the routine only runs them and handles the chat. Keeps token cost low.
- **5 dinners/week by default**, `--count N` overrides. Leaves nights for leftovers.
- **No kid-friendly rule.** Rotation and variety only.
- **Plan path changes to `plans/YYYY/Www.md`** (was `plans/YYYY-Www.md` in AGENTS.md; intentional rename, no files exist yet). Folder is the ISO week-year: Dec 28 2026 is `plans/2026/W53.md`; Dec 29 2025 is `plans/2026/W01.md`.
- **One file per week, no weekday assignment.** Frontmatter, Dinners list, Groceries by aisle. One file to review per PR.
- **All dates use `America/Chicago`.** `main.ts` sets `process.env.TZ = 'America/Chicago'` before any date math, and the `test` script runs `TZ=America/Chicago bun test`. The routine computes week ids only through `main.ts`.
- **Rotation counts ISO week distance, not plan files.** Distance 1 excluded, 2 weight 0.25, 3+ weight 1. A missing week counts as elapsed time.
- **History is every plan within distance 1-2 in either direction.** Planning W43 after W44 exists still excludes W44's dinners.
- **Variety is soft.** Multiply weight by 0.5 per already-picked dinner with the same `protein`, and 0.5 per one with the same `method`. `protein` of `none`, `mixed`, or undefined never counts as shared. Never fails to fill.
- **Picks are reproducible.** Seed defaults to the week id (`2026-W43`). FNV-1a 32-bit hashes the seed string into mulberry32. Candidates sort by id (plain `<` code-unit order) before each draw. Weights recompute after each pick; sampling is without replacement.
- **Primitives are `drop` and `add`.** Swap = drop + add. Resizing to 3 nights = drop twice.
- **Dropped ids are recorded in frontmatter `dropped: [...]`.** Random `add` excludes them for that week; `add --id` may re-add one (undo a drop) and removes it from `dropped`. `plan --exclude` ids are written to `dropped` too, so reruns and later adds honor them. Rotation ignores `dropped`, so they stay eligible next week.
- **`add` treats the current `dinners` as already picked** for variety weighting.
- **Short pool writes what it can.** If eligible < count, `plan`/`add` writes the partial result, prints a warning to stderr, and exits 0. The routine mentions it in the PR body.
- **CLI refuses to modify weeks before the current ISO week** (`plan`, `drop`, `add`, `groceries`). AGENTS.md: past weeks are history.
- **Optional items get `optional?: boolean`** on `RecipeIngredient`; groceries skip them.
- **Delivery: draft PR per week on `plan/YYYY-Www`.** `main` protection stays intact (strict, `typecheck` required, no approvals). Repo has `allow_auto_merge` and `delete_branch_on_merge` enabled (verified 2026-10-18).
- **Strict protection is handled, not relaxed.** On "go", the routine runs `gh pr update-branch` before enabling auto-merge.
- **Routine closes stale `plan/*` PRs for earlier weeks** with `gh pr close --delete-branch`. Unmerged plans are not history: they were never agreed.
- **Same-week rerun reuses the open PR.** If `plan/<target>` already has an open PR, the routine skips `plan`, checks out that branch, and asks again. No re-plan, no force push.
- **Already-merged target stops the run.** If `plans/YYYY/Www.md` for `<target>` exists on `main`, the routine reports "<target> is already planned" and ends.
- **Swaps happen in the routine's own cloud session** (claude.ai/code or mobile). Per https://code.claude.com/docs/en/routines and https://code.claude.com/docs/en/claude-code-on-the-web, each run is a session you can continue; an idle session accepts replies until the environment expires.
- **Fallback when the session expired:** a local Claude session checks out `plan/<week>`, takes `<target>` from the branch name, and follows the routine prompt from step 5.
- **No post-merge pipeline in v1.** The merged file is the grocery list; GitHub mobile renders it.
- **Notification is GitHub's draft-PR email.** Routine push notifications are undocumented.
- **No Co-authored-by or tool-attribution lines** in commits or PRs.

## Terms Clarified

- **Week id**: ISO 8601 week, `YYYY-Www` (e.g. `2026-W43`), where `YYYY` is the ISO week-year, computed in `America/Chicago`. _Avoid_: calendar year, "week number" alone.
- **Plan**: one file `plans/YYYY/Www.md`; its frontmatter `dinners` list is the rotation history. _Avoid_: "menu", "schedule".
- **Dinner id**: the dinner's filename without `.ts` (`stroganoff`). _Avoid_: title.
- **Week distance**: absolute difference between two week ids, in ISO weeks.

## Data conventions the scripts must handle

- `qty` and `unit` are often missing ("to taste", garnishes, "per the box").
- One item can appear with different units across recipes (`minced garlic` as `clove`, `tsp`, `tbsp`).
- Some quantities approximate a range; the range lives in `note`. Render the note; never parse it.
- Brand items stay branded (Prego meat sauce, Jimmy Dean sausage, Annie's, Good & Gather meatballs).
- Every `item` is an `IngredientName`, so `tsc` already guarantees registry membership.

## Test Cases

Planner (pure, data injected):
- never picks a dinner planned at week distance 1, past or future
- `weight` returns 0 at distance 1, 0.25 at distance 2, 1 at distance 3+ and with no history
- treats a skipped week as elapsed time: dinner in W40, no W41, target W42 has weight 0.25
- halves weight per picked dinner sharing protein and per one sharing method; `none`/`mixed`/undefined protein never halve
- same seed and history yield identical picks regardless of input dinner order
- fills `--count` even when every eligible dinner is beef/stovetop
- short pool returns fewer picks plus a shortfall flag
- `--exclude id` removes that dinner; first run with no history picks from all dinners
- random `add` never returns an id in `dropped` or already in `dinners`
- `add --id` of a dropped id re-adds it and removes it from `dropped`
- `plan --exclude X` records X in `dropped`
- `add --method crockpot` returns only crockpot dinners; no match returns none plus a shortfall flag
- drop X then add, repeated twice, never yields X and uses distinct seeds

Week math:
- computes week distance across ISO year boundaries (2026-W53 to 2027-W01 is 1)
- maps Dec 28 2026 to `plans/2026/W53.md` and Dec 29 2025 to `plans/2026/W01.md` (construct dates as `new Date(2026, 11, 28)` under `TZ=America/Chicago`)
- `weekStart('2026-W43')` is `2026-10-19`

Groceries (pure):
- sums qty for the same item + unit
- one line per item; parts ordered unitless count first, then `Unit` union order: `minced garlic: 1 tsp + 2 clove`
- qty-less entries of an item that also has qty'd entries append nothing to the qty; their notes still render: `egg noodles: 12 oz (for serving)`
- items with no qty anywhere render as bare name
- notes from all entries render deduped in first-seen-by-dinner-id order, in parentheses: `yellow onion: 1.5 (diced, cut into strips)`
- rounds summed qty to 2 decimals, strips trailing zeros (`0.1 + 0.2` -> `0.3`, `2.67`)
- skips `staple: true` and `optional: true`
- groups by `aisle` in `AISLES` order; omits empty aisles; sorts items by plain `<` code-unit order

Plan file and CLI:
- parse(serialize(plan)) round-trips, including empty `dropped`
- `plan` on an existing file exits 1 without writing; `plan --force` overwrites
- delete-and-rerun `plan --week 2026-W43` produces identical bytes
- `drop id` moves it from `dinners` to `dropped` and regenerates the body
- `drop` of an id not in `dinners` exits 1 without writing
- `drop`/`add`/`groceries` with no plan file for the week exits 1
- every command on a week before the current ISO week exits 1 without writing

## Implementation Plan

### What we're building

A `main.ts` CLI that plans a week of dinners with rotation and variety, and writes the plan with a merged grocery list. A weekly cloud routine runs it, opens a draft PR, takes swaps by chat, and auto-merges on "go".

### Approach

1. Add `optional?: boolean` to `RecipeIngredient` and migrate the 8 `note: 'optional...'` ingredients across 7 files.
2. Build pure core modules test-first with `bun test`: week math, dinner loader, plan-file parse/serialize, weighted picker, grocery merge.
3. Wrap them in a `main.ts` CLI with `plan`, `drop`, `add`, `groceries`.
4. Add `bun test` to CI, check the routine prompt into the repo, update README and AGENTS.md.
5. Verify the cloud env (bun, gh), then create the weekly routine with the `schedule` skill.

### CLI

All commands take `--week YYYY-Www`; default is next ISO week (America/Chicago). Exit 1 on any refusal.

- `bun main.ts plan [--week] [--count 5] [--seed S] [--exclude id ...] [--force]`: writes `plans/YYYY/Www.md`.
- `bun main.ts drop <id> [--week]`: moves id to `dropped`.
- `bun main.ts add [--method M] [--protein P] [--id id] [--week]`: `--id` adds a specific dinner, rejecting distance-1 ids; a dropped id is allowed and leaves `dropped`. Seed is `<plan seed>:add:<dinners.length + dropped.length>`.
- `bun main.ts week [--offset N]`: prints the ISO week id N weeks after the current one (default 1). The routine uses this for `<target>`.
- `bun main.ts groceries [--week]`: regenerates the body from frontmatter (for hand edits).
- Use `node:util` `parseArgs`. Unknown dinner ids exit 1 and list close matches: substring hits first, else Levenshtein distance <= 2.

### Plan file format

```
---
week: 2026-W43
starts: 2026-10-19
seed: 2026-W43
dinners: [stroganoff, french-dips, flautas, sloppy-joes, white-chicken-chili]
dropped: []
---

## Dinners

- [Stroganoff](../../dinners/stroganoff.ts)
...

## Groceries

### produce
- mushrooms: 1 lb (sliced)
- yellow onion: 1.5 (diced)
...
```

- Frontmatter is the only parsed part; body is regenerated wholesale on every write.
- `dinners` and `dropped` are flow-style lists of bare ids. Hand-parse; no YAML dependency.
- Dinners list keeps frontmatter order (pick order).

### Files to touch

- `src/types.ts`: `optional?: boolean` on `RecipeIngredient`; `export const AISLES = [...] as const` with `Aisle = typeof AISLES[number]`; same for `UNITS`/`Unit`
- `dinners/` chef-salad, foil-hamburger-packet, chicken-fried-rice, gringo-tacos-nachos, crock-pot-chicken-and-gravy, dual-sauce-cheesy-spaghetti-bake (2 items), salsa-verde-chicken-tacos: set `optional: true`, strip the leading "optional" from `note`, keep the rest (`'or water'`, `'toasted'`), drop the note if empty
- `src/week.ts`: `weekId(date)`, `nextWeek(id)`, `weekDistance(a, b)`, `weekStart(id)`, `planPath(id)`
- `src/dinners.ts`: `loadDinners()` via `new Bun.Glob('dinners/*.ts')` scanned with `{ cwd: <repo root from import.meta.dir> }` + dynamic `import()`, returns `Record<string, Recipe>` keyed by id (async)
- `src/plan-file.ts`: `Plan` type, `parsePlan`, `serializePlan`, `readHistory(target)` (distance 1-2 both directions)
- `src/planner.ts`: `fnv1a`, `mulberry32`, `weight`, `pick`, `add`
- `src/groceries.ts`: `mergeGroceries(recipes)` -> aisle-grouped lines
- `main.ts`: TZ pin, arg parsing, file IO, past-week guard
- `src/*.test.ts`: tests above; unit tests take data, no filesystem
- `package.json`: `"test": "TZ=America/Chicago bun test"`
- `.github/workflows/check.yml`: add `bun run test` step inside the existing `typecheck` job (required check name unchanged)
- `routine/weekly-plan.md`: the routine prompt (below)
- `README.md`, `AGENTS.md`: commands, new `plans/YYYY/Www.md` path, plan workflow

### Routine prompt (routine/weekly-plan.md)

`<target>` is `TARGET_WEEK` if the invoking prompt sets it, else `bun main.ts week`. Every command after step 1 passes `--week <target>`. `DRY_RUN=1` in the invoking prompt means: never run `gh pr merge`.

1. `bun install`. Compute `<target>`.
2. Skip under `DRY_RUN=1`. Else close open PRs with head `plan/*` for weeks before `bun main.ts week --offset 1`, regardless of `<target>`, so an override can never close next week's live PR: `gh pr close <n> --delete-branch`.
3. If `plans/YYYY/Www.md` for `<target>` exists on `main`, report "<target> is already planned" and stop. If an open PR for `plan/<target>` exists, check it out and skip to step 4. Else run `bun main.ts plan --week <target>`, commit `Plan dinners <target>` on `plan/<target>`, push, `gh pr create --draft --title "Dinner plan <target>"` with the dinner list and any shortfall warning in the body.
4. End the turn: "Good to go, or any swaps / fewer nights?"
5. Swaps: run `drop`/`add` with `--week <target>`, commit `Swap <target>: drop <a>, add <b>` (or `Drop <a>` / `Add <b>`), push, reply with the new list. Never hand-edit frontmatter when a command covers it.
6. On "go": `bun run check && bun run test`. Under `DRY_RUN=1`, stop here and see below. Else `gh pr ready`, `gh pr update-branch`, `gh pr merge --auto --squash`. Then report `gh pr view --json state,mergeStateStatus`; if `BEHIND`, run `gh pr update-branch` again.
   - `DRY_RUN=1`: after checks pass, report `gh pr view --json state,mergeStateStatus`, then `gh pr close --delete-branch`. Never runs `gh pr ready` or `gh pr merge`.
- No Co-authored-by or tool-attribution lines.

### How to verify

- `bun run check` and `bun run test` pass locally and in CI
- `bun main.ts plan --week 2026-W43` writes `plans/2026/W43.md`; delete and rerun gives identical bytes
- Cloud env (Trusted network): setup script installs bun (`curl -fsSL https://bun.sh/install | bash`, fallback `npm i -g bun`); `bun --version` and `gh auth status` succeed
- Dry run (after the implementation PR merges, since the routine reads `routine/weekly-plan.md` from `main`): create a one-off routine with `schedule` whose prompt is `TARGET_WEEK=<output of bun main.ts week --offset 2> DRY_RUN=1` followed by "follow routine/weekly-plan.md". It opens a draft PR, waits, accepts one swap, and on "go" runs checks, reports state, then closes its own PR. Step 2 is skipped, so other plan PRs are untouched. Nothing lands on `main`.
- If `gh` is unavailable in the cloud env, switch steps 2, 3, 6 to the GitHub integration and record which in `routine/weekly-plan.md`

### Assumptions

- Routine runs Saturday 08:00 America/Chicago (cron `0 8 * * 6` in that TZ) and targets next ISO week. If `schedule` only takes UTC, use `0 13 * * 6` (08:00 CDT; 07:00 CST in winter is acceptable).
- Commits come from whatever identity the routine's GitHub auth uses; acceptable as long as no attribution trailers are added.
- Mixed units are never converted.
- No lunch planning, no post-merge pipeline, no Slack in v1.
