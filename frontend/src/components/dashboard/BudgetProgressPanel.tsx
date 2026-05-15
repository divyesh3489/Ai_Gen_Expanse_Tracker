import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import type { BudgetSummaryRow } from '../../features/dashboard/dashboardTypes'
import { formatINR } from '../../utils/currency'

function num(v: number | string | null | undefined) {
  return Number(v) || 0
}

type Props = {
  rows: BudgetSummaryRow[]
  loading: boolean
  error: boolean
  onRetry: () => void
}

export function BudgetProgressPanel({ rows, loading, error, onRetry }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Budget Progress</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Spend vs cap in this period</p>
        </div>
        <Link to="/app/budgets" className="shrink-0 text-xs font-medium text-sky-600 hover:underline dark:text-sky-400">
          View all →
        </Link>
      </div>
      {error ? (
        <div className="mt-4 rounded-lg border border-rose-900/40 bg-rose-950/30 p-3">
          <p className="text-xs text-rose-200">Could not load budgets.</p>
          <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <ul className="mt-4 max-h-72 space-y-4 overflow-y-auto pr-1">
          {!error && !rows.length ? (
            <li className="text-center text-sm text-slate-500 dark:text-slate-400">No budgets in this range.</li>
          ) : null}
          {rows.map((b) => {
            const spent = num(b.spent_amount)
            const cap = num(b.budget_amount)
            const pct = b.progress_percent != null ? num(b.progress_percent) : cap ? (spent / cap) * 100 : 0
            const over = b.is_over_budget || pct > 100
            const barPct = Math.min(pct, 150)
            return (
              <li key={b.id}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium text-slate-800 dark:text-slate-100">{b.category_name ?? 'Overall'}</span>
                  <span className={over ? 'font-semibold text-rose-500' : 'text-slate-500 dark:text-slate-400'}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {formatINR(spent)} / {formatINR(cap)}
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={over ? 'h-full rounded-full bg-rose-500' : 'h-full rounded-full bg-sky-500'}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
