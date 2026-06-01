import { Crown, Lightbulb, TrendingUp, Wallet } from 'lucide-react'
import type { DashboardSummary } from '../../features/expanses/dashboardSummaryApi'
import type { ExpenseCategorySlice } from '../../features/dashboard/dashboardTypes'

function num(v: number | string | null | undefined) {
  return Number(v) || 0
}

type Props = {
  summary: DashboardSummary | null
  topCategory: ExpenseCategorySlice | null
  compact?: boolean
}

export function InsightsRow({ summary, topCategory, compact = false }: Props) {
  const spendChg = summary?.last_month_spend_change_percent
  const hasSpendTrend = spendChg !== null && spendChg !== undefined
  const spendChange = num(spendChg)
  const rate = summary ? num(summary.saving_rate_percent) : 0
  const tip =
    topCategory?.category === 'Shopping'
      ? 'Consider reducing shopping expenses if you are over budget.'
      : topCategory
        ? `Watch spending on ${topCategory.category} to stay on track.`
        : 'Add expenses to unlock personalized tips.'

  const cards = [
    {
      icon: TrendingUp,
      color: 'text-emerald-500 dark:text-emerald-400',
      borderClass: 'border-l-[3px] border-l-emerald-500',
      title: hasSpendTrend
        ? `Spending ${spendChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(spendChange).toFixed(1)}%`
        : 'Spending trend',
      body: hasSpendTrend ? 'Vs prior month.' : 'MoM when viewing current month.',
    },
    {
      icon: Crown,
      color: 'text-amber-500 dark:text-amber-400',
      borderClass: 'border-l-[3px] border-l-amber-500',
      title: topCategory ? `Top: ${topCategory.category}` : 'Top category: —',
      body: topCategory ? `${topCategory.percent.toFixed(0)}% of spend.` : 'No spend yet.',
    },
    {
      icon: Wallet,
      color: 'text-sky-500 dark:text-sky-400',
      borderClass: 'border-l-[3px] border-l-sky-500',
      title: rate > 40 ? `Saved ${rate.toFixed(1)}%` : `Rate ${rate.toFixed(1)}%`,
      body: rate > 40 ? 'Above 40% this period.' : 'Trim expenses to lift rate.',
    },
    {
      icon: Lightbulb,
      color: 'text-violet-500 dark:text-violet-400',
      borderClass: 'border-l-[3px] border-l-violet-500',
      title: 'Tip',
      body: tip,
    },
  ]

  if (compact) {
    return (
      <div className="h-full max-h-[70px] overflow-hidden">
        <div className="grid h-full grid-cols-4 gap-2">
          {cards.map((c, idx) => {
            const Icon = c.icon
            return (
              <div
                key={idx}
                className={`flex min-w-0 items-start gap-1.5 overflow-hidden rounded-lg border border-slate-200 bg-[#F8F9FA] px-2 py-2 dark:border-slate-800 dark:bg-slate-900/60 ${c.borderClass}`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${c.color}`} />
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-bold leading-tight text-[#1A1A2E] dark:text-white">
                    {c.title}
                  </div>
                  <p className="truncate text-[10px] leading-tight text-slate-500 dark:text-slate-400">{c.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Insights for you</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, idx) => {
          const Icon = c.icon
          return (
            <div
              key={idx}
              className={`rounded-xl border border-slate-200 bg-[#F8F9FA] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 ${c.borderClass}`}
            >
              <Icon className={`h-5 w-5 ${c.color}`} />
              <div className="mt-2 text-sm font-semibold text-[#1A1A2E] dark:text-white">{c.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{c.body}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
