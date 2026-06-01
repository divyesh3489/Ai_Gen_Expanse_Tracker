import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import type { BudgetSummaryRow } from '../../features/dashboard/dashboardTypes'
import { formatINR } from '../../utils/currency'
import { DASHBOARD_CARD_TITLE, DASHBOARD_PANEL_CARD } from '../../features/dashboard/dashboardCardStyles'

function num(v: number | string | null | undefined) {
  return Number(v) || 0
}

type Props = {
  rows: BudgetSummaryRow[]
  loading: boolean
  error: boolean
  onRetry: () => void
  compact?: boolean
}

export function BudgetProgressPanel({ rows, loading, error, onRetry, compact = false }: Props) {
  return (
    <div className={`${DASHBOARD_PANEL_CARD} flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden`}>
      <div className="flex shrink-0 items-start justify-between gap-1">
        <div>
          <h2 className={DASHBOARD_CARD_TITLE}>Budget Progress</h2>
          {!compact ? (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Spend vs cap in this period</p>
          ) : null}
        </div>
        <Link
          to="/app/budgets"
          className="shrink-0 text-[11px] font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          View all →
        </Link>
      </div>

      {error ? (
        <div className="dashboard-budget-body mt-1 flex items-center justify-center rounded-md border border-rose-200 bg-rose-50 px-2 dark:border-rose-900/40 dark:bg-rose-950/30">
          <p className="text-[11px] text-rose-700 dark:text-rose-200">Could not load budgets.</p>
          <Button type="button" variant="ghost" size="sm" className="ml-2 h-7" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="dashboard-budget-body mt-1 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
      ) : (
        <ul className="dashboard-budget-body mt-1 min-h-0 overflow-y-auto">
          {!error && !rows.length ? (
            <li className="flex h-10 items-center justify-center text-center text-xs text-slate-500 dark:text-slate-400">
              No budgets in this range.
            </li>
          ) : null}
          {rows.map((b) => {
            const spent = num(b.spent_amount)
            const cap = num(b.budget_amount)
            const pct = b.progress_percent != null ? num(b.progress_percent) : cap ? (spent / cap) * 100 : 0
            const over = b.is_over_budget || pct > 100
            const barPct = Math.min(pct, 150)
            return (
              <li key={b.id} className="py-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate font-medium text-slate-800 dark:text-slate-100">
                    {b.category_name ?? 'Overall'}
                  </span>
                  <span className={over ? 'font-semibold text-rose-500' : 'text-slate-500 dark:text-slate-400'}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {formatINR(spent)} / {formatINR(cap)}
                </div>
                <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
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
