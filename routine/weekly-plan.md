# Weekly dinner plan routine

Prompt for the weekly Claude cloud routine (Saturday 08:00 America/Chicago). Spec: `docs/specs/2026-10-18-weekly-dinner-automation.md`.

## Inputs

- `<target>` is `TARGET_WEEK` if the invoking prompt sets it, else the output of `bun main.ts week`.
- Every command after step 1 passes `--week <target>`.
- `DRY_RUN=1` in the invoking prompt means: never run `gh pr merge` or `gh pr ready`.
- Compute week ids only through `main.ts`. It pins `America/Chicago`.

## Steps

1. Run `bun install`. Compute `<target>`.
2. Skip this step under `DRY_RUN=1`. Otherwise, close every open PR with head `plan/*` for a week before `bun main.ts week --offset 1`, regardless of `<target>`: `gh pr close <n> --delete-branch`. Unmerged plans were never agreed, so they are not history.
3. Pick one:
   - If `plans/YYYY/Www.md` for `<target>` exists on `main`, report "<target> is already planned" and stop.
   - If an open PR for `plan/<target>` exists, check out that branch and go to step 4. Do not re-plan or force push.
   - Otherwise run `bun main.ts plan --week <target>`. Commit `Plan dinners <target>` on branch `plan/<target>` and push. Run `gh pr create --draft --title "Dinner plan <target>"` with the dinner list in the body. If `plan` printed a shortfall warning, include it in the body.
4. End the turn with: "Good to go, or any swaps / fewer nights?"
5. For each swap request, run `bun main.ts drop <id> --week <target>` and/or `bun main.ts add [--method M] [--protein P] [--id id] --week <target>`. Commit `Swap <target>: drop <a>, add <b>` (or `Drop <a>` / `Add <b>`), push, and reply with the new dinner list. Never hand-edit frontmatter when a command covers it. Fewer nights means `drop` with no `add`.
6. On "go", run `bun run check && bun run test`.
   - Under `DRY_RUN=1`: after checks pass, report `gh pr view --json state,mergeStateStatus`, then run `gh pr close --delete-branch`. Stop.
   - Otherwise: `gh pr ready`, `gh pr update-branch`, `gh pr merge --auto --squash`. Report `gh pr view --json state,mergeStateStatus`. If it is `BEHIND`, run `gh pr update-branch` again.

## Rules

- No `Co-authored-by` or tool-attribution lines in commits or PRs.
- Never commit to `main`.

## Fallback when the cloud session expired

From a local Claude session: check out `plan/<week>`, take `<target>` from the branch name, and follow this file from step 5.
