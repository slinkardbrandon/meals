# Meals

One file per dinner in `dinners/`. Weekly plans land in `plans/` (e.g. `plans/2026-W42.md`) and double as rotation history.

## Dinner file format

```yaml
---
name: Stroganoff
kid_friendly: true | false
protein: beef | chicken | turkey | pork | egg | beans | chickpea | mixed | none
method: stovetop | oven | crockpot | instant-pot | grill | smoker | no-cook
source: https://... (optional)
---
```

Body sections: `## Ingredients`, `## Steps`, `## Notes` (our modifications to the source recipe).
