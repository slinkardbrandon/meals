# Meals

Family meal planning data and CLI: dinners, ingredients, weekly plans, and grocery lists.

## Language

**Newest plan**:
The plan in `plans/` with the greatest week id on `main`, regardless of today's date. It is usually next week's plan, since plans merge before their week starts.
_Avoid_: "current week", "this week"

**Week id**:
An ISO week in `YYYY-Www` form (e.g. `2026-W46`), taken from a plan's `week:` metadata. `YYYY` is the ISO week-year.
_Avoid_: "week number", "plan path" (`plans/2026/W46.md` is the path, not the id)
