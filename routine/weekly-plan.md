# Weekly dinner plan routine

Prompt for the weekly Claude cloud routine (Saturday 08:00 America/Chicago). Spec: `docs/specs/2026-10-18-weekly-dinner-automation.md`.

## Inputs

- `<target>` is `TARGET_WEEK` if the invoking prompt sets it, else the output of `bun main.ts week`.
- Every command after step 1 passes `--week <target>`.
- `DRY_RUN=1` in the invoking prompt means: never merge a PR or mark one ready for review.
- Compute week ids only through `main.ts`. It pins `America/Chicago`.

## GitHub access

- Git commands (`fetch`, `push`, `push --delete`) work as usual in the cloud session.
- Do all PR work through the session's GitHub integration tools. Do not use `gh`: `api.github.com` is unreachable from the cloud sandbox (403, verified 2026-10-18), so `gh` cannot authenticate.

## Steps

1. Run `bun install`. Compute `<target>`.
2. Skip this step under `DRY_RUN=1`. Otherwise, close every open PR with head `plan/*` for a week before `bun main.ts week --offset 1`, regardless of `<target>`. Close each one through the GitHub integration, then delete its branch with `git push origin --delete <branch>`. Unmerged plans were never agreed, so they are not history.
3. Pick one:
   - If `plans/YYYY/Www.md` for `<target>` exists on `main`, report "<target> is already planned" and stop.
   - If an open PR for `plan/<target>` exists, check out that branch and go to step 4. Do not re-plan or force push.
   - Otherwise run `bun main.ts plan --week <target>`. Commit `Plan dinners <target>` on branch `plan/<target>` and push. Open a draft PR into `main` titled `Dinner plan <target>` with the dinner list in the body. If `plan` printed a shortfall warning, include it in the body.
4. End the turn with: "Good to go, or any swaps / fewer nights?"
5. For each swap request, run `bun main.ts drop <id> --week <target>` and/or `bun main.ts add [--method M] [--protein P] [--id id] --week <target>`. Commit `Swap <target>: drop <a>, add <b>` (or `Drop <a>` / `Add <b>`), push, and reply with the new dinner list. Never hand-edit frontmatter when a command covers it. Fewer nights means `drop` with no `add`.
6. On "go", run `bun run check && bun run test`.
   - Under `DRY_RUN=1`: after checks pass, report the PR's state and mergeable state. Close the PR and delete `plan/<target>` with `git push origin --delete`. Stop.
   - Otherwise: mark the PR ready for review and update its branch from `main`. Enable auto-merge with squash. If the integration can't enable auto-merge, wait for the `typecheck` check to pass, then squash-merge. Report the PR's final state. If it is behind `main`, update the branch again.

## Rules

- No `Co-authored-by` or tool-attribution lines in commits or PRs.
- Never commit to `main`.

## Fallback when the cloud session expired

From a local Claude session: check out `plan/<week>`, take `<target>` from the branch name, and follow this file from step 5.
