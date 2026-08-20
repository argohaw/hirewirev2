export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ');
}

export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string,
): string {
  if (min == null && max == null) return '—';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  });
  if (min != null && max != null && min !== max) {
    return `${formatter.format(min)} – ${formatter.format(max)}`;
  }
  return formatter.format(min ?? max ?? 0);
}

export function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
