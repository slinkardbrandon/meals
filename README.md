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
servings: 6
ingredients:
  - { item: ground beef, qty: 1, unit: lb }
---
```

Body sections: `## Ingredients`, `## Steps`, `## Notes` (our modifications to the source recipe).

## Lunch item format

One file per item in `lunch-items/`. Per-kid quirks live in `kids.yml`.

```yaml
---
name: Turkey Sandwich
category: main | side | snack | drink
kids: { sylvia: likes, wally: tolerates }  # missing kid = won't eat it
---
```
