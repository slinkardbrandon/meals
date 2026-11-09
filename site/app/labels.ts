const LABELS: Record<string, string> = {
  'instant-pot': 'Instant Pot',
  'air-fryer': 'Air fryer',
  'no-cook': 'No cook',
}

/** Display label for a method or protein value. */
export const label = (value: string) => LABELS[value] ?? value.charAt(0).toUpperCase() + value.slice(1)
