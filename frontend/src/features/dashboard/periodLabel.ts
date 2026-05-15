import type { CustomMonth, PeriodPreset } from './dashboardTypes'

const LABELS: Record<PeriodPreset, string> = {
  this_month: 'This month',
  last_month: 'Last month',
  last_3: 'Last 3 months',
  last_6: 'Last 6 months',
  custom: 'Custom range',
}

export function labelForPeriod(preset: PeriodPreset, customMonth: CustomMonth): string {
  if (preset !== 'custom') return LABELS[preset]
  const d = new Date(customMonth.year, customMonth.month - 1, 1)
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}
