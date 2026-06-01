import { Calendar, ChevronDown } from 'lucide-react'
import type { CustomMonth, PeriodPreset } from '../../features/dashboard/dashboardTypes'
import { toMonthInputValue, parseMonthInputValue } from '../../features/dashboard/dateRange'

type Props = {
  greeting: string
  firstName: string
  periodPreset: PeriodPreset
  onPeriodChange: (p: PeriodPreset) => void
  customMonth: CustomMonth
  onCustomMonthChange: (c: CustomMonth) => void
  compact?: boolean
}

const PERIOD_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'last_3', label: 'Last 3 months' },
  { value: 'last_6', label: 'Last 6 months' },
  { value: 'custom', label: 'Custom' },
]

export function DashboardHeader({
  greeting,
  firstName,
  periodPreset,
  onPeriodChange,
  customMonth,
  onCustomMonthChange,
  compact = false,
}: Props) {
  return (
    <div className={`flex flex-col lg:flex-row lg:items-start lg:justify-between ${compact ? 'gap-2' : 'gap-4'}`}>
      <div>
        <h1
          className={`font-semibold tracking-tight text-slate-900 dark:text-white ${
            compact ? 'text-base leading-tight' : 'text-2xl'
          }`}
        >
          {greeting}, {firstName} 👋
        </h1>
        <p
          className={`mt-1 text-slate-600 dark:text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          Here&apos;s what&apos;s happening with your finances today.
        </p>
      </div>
      <div className={`flex w-full shrink-0 flex-col gap-2 ${compact ? 'lg:w-72' : 'lg:w-96'}`}>
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500 opacity-60 dark:text-slate-400" />
          <select
            aria-label="Dashboard period"
            className={`w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:shadow-none ${
              compact ? 'py-2' : 'py-2.5'
            }`}
            value={periodPreset}
            onChange={(e) => onPeriodChange(e.target.value as PeriodPreset)}
          >
            {PERIOD_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {periodPreset === 'custom' ? (
          <label className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Choose month</span>
            <input
              type="month"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              value={toMonthInputValue(customMonth)}
              onChange={(e) => {
                const p = parseMonthInputValue(e.target.value)
                if (p) onCustomMonthChange(p)
              }}
            />
          </label>
        ) : null}
      </div>
    </div>
  )
}
