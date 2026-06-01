import type { ReactNode } from 'react'
import { Briefcase, CreditCard, Rocket, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
  compact?: boolean
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconClass,
  footer,
  compact,
}: {
  label: string
  value: string
  icon: LucideIcon
  iconClass: string
  footer: ReactNode
  compact?: boolean
}) {
  return (
    <div
      className={`dashboard-card rounded-xl border border-slate-200 bg-[#F8F9FA] shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none ${
        compact ? 'p-2.5' : 'p-4'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
          <p
            className={`font-semibold tabular-nums text-[#1A1A2E] dark:text-white ${
              compact ? 'mt-0.5 text-[clamp(18px,1.6vw,24px)] leading-tight' : 'mt-1 text-2xl'
            }`}
          >
            {value}
          </p>
          {footer ? <div className={compact ? 'mt-1' : 'mt-2'}>{footer}</div> : null}
        </div>
        <div
          className={`grid shrink-0 place-items-center rounded-xl ${iconClass} ${
            compact ? 'h-8 w-8' : 'h-10 w-10'
          }`}
        >
          <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
        </div>
      </div>
    </div>
  )
}

export function SummaryCards({ summary, loading, error, onRetry, compact = false }: Props) {
  const gridClass = `dashboard-kpi-grid ${compact ? 'gap-2' : 'gap-3'}`

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
      <div className={gridClass}>
        <StatCardSkeleton compact={compact} />
        <StatCardSkeleton compact={compact} />
        <StatCardSkeleton compact={compact} />
        <StatCardSkeleton compact={compact} />
      </div>
    )
  }

  const sr = savingRateMoMPercent(summary)

  return (
    <div className={gridClass}>
      <KpiCard
        compact={compact}
        label="Total Income"
        value={formatINR(num(summary.total_monthly_income))}
        icon={Briefcase}
        iconClass="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        footer={<DeltaBadge value={trendPercent(summary.last_month_income_change_percent)} compact={compact} />}
      />
      <KpiCard
        compact={compact}
        label="Total Expense"
        value={formatINR(num(summary.total_monthly_spend))}
        icon={CreditCard}
        iconClass="bg-rose-500/15 text-rose-600 dark:text-rose-400"
        footer={<DeltaBadge value={trendPercent(summary.last_month_spend_change_percent)} inverse compact={compact} />}
      />
      <KpiCard
        compact={compact}
        label="Net Savings"
        value={formatINR(num(summary.net_monthly))}
        icon={Rocket}
        iconClass="bg-violet-500/15 text-violet-600 dark:text-violet-400"
        footer={<DeltaBadge value={trendPercent(summary.last_month_net_change_percent)} compact={compact} />}
      />
      <KpiCard
        compact={compact}
        label="Savings Rate"
        value={`${num(summary.saving_rate_percent).toFixed(1)}%`}
        icon={Shield}
        iconClass="bg-sky-500/15 text-sky-600 dark:text-sky-400"
        footer={
          sr === null ? (
            <span className="text-sm text-slate-500 dark:text-slate-400">—</span>
          ) : (
            <DeltaBadge value={sr} compact={compact} />
          )
        }
      />
    </div>
  )
}
