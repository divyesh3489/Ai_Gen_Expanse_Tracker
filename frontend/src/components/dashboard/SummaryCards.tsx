import { Briefcase, CreditCard, Rocket, Shield } from 'lucide-react'
import { Button } from '../ui/Button'
import { formatINR } from '../../utils/currency'
import type { DashboardSummary } from '../../features/expanses/dashboardSummaryApi'
import { savingRateMoMPercent } from '../../features/dashboard/trendUtils'
import { DeltaBadge, StatCardSkeleton } from './statPrimitives'

function num(v: number | string | null | undefined): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function trendPercent(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

type Props = {
  summary: DashboardSummary | null
  loading: boolean
  error: boolean
  onRetry: () => void
}

export function SummaryCards({ summary, loading, error, onRetry }: Props) {
  if (error && !loading) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/40">
        <p className="text-sm text-rose-800 dark:text-rose-200">Could not load dashboard summary.</p>
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      </div>
    )
  }

  if (loading || !summary) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  const sr = savingRateMoMPercent(summary)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Income</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{formatINR(num(summary.total_monthly_income))}</div>
            <div className="mt-2">
              <DeltaBadge value={trendPercent(summary.last_month_income_change_percent)} />
            </div>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Briefcase className="h-5 w-5" aria-hidden />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Expense</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{formatINR(num(summary.total_monthly_spend))}</div>
            <div className="mt-2">
              <DeltaBadge value={trendPercent(summary.last_month_spend_change_percent)} inverse />
            </div>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-400">
            <CreditCard className="h-5 w-5" aria-hidden />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">Net Savings</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{formatINR(num(summary.net_monthly))}</div>
            <div className="mt-2">
              <DeltaBadge value={trendPercent(summary.last_month_net_change_percent)} />
            </div>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-400">
            <Rocket className="h-5 w-5" aria-hidden />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">Savings Rate</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{num(summary.saving_rate_percent).toFixed(1)}%</div>
            <div className="mt-2">
              {sr === null ? <span className="text-sm text-slate-500 dark:text-slate-400">—</span> : <DeltaBadge value={sr} />}
            </div>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500/15 text-sky-400">
            <Shield className="h-5 w-5" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}
