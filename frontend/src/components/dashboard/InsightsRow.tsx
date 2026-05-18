import { Crown, Lightbulb, TrendingUp, Wallet } from 'lucide-react'
import type { DashboardSummary } from '../../features/expanses/dashboardSummaryApi'
import type { ExpenseCategorySlice } from '../../features/dashboard/dashboardTypes'

function num(v: number | string | null | undefined) {
  return Number(v) || 0
}

type Props = {
  summary: DashboardSummary | null
  topCategory: ExpenseCategorySlice | null
}

export function InsightsRow({ summary, topCategory }: Props) {
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
      borderClass: 'border-l-4 border-l-emerald-500',
      title: hasSpendTrend
        ? `Spending ${spendChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(spendChange).toFixed(1)}%`
        : 'Spending trend',
      body: hasSpendTrend
        ? 'Compared to the prior month (current month view only).'
        : 'Month-over-month comparison is available only when the selected range is the current calendar month.',
    },
    {
      icon: Crown,
      color: 'text-amber-500 dark:text-amber-400',
      borderClass: 'border-l-4 border-l-amber-500',
      title: topCategory ? `Top category: ${topCategory.category}` : 'Top category: —',
      body: topCategory ? `${topCategory.percent.toFixed(0)}% of expenses in this range.` : 'No category spend in this range yet.',
    },
    {
      icon: Wallet,
      color: 'text-sky-500 dark:text-sky-400',
      borderClass: 'border-l-4 border-l-sky-500',
      title: rate > 40 ? `Great job! You saved ${rate.toFixed(1)}%` : `Savings rate: ${rate.toFixed(1)}%`,
      body: rate > 40 ? 'Your savings rate is above 40% for this period.' : 'Try increasing income or trimming expenses to lift your rate.',
    },
    {
      icon: Lightbulb,
      color: 'text-violet-500 dark:text-violet-400',
      borderClass: 'border-l-4 border-l-violet-500',
      title: 'Tip',
      body: tip,
    },
  ]

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Insights for you</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, idx) => {
          const Icon = c.icon
          return (
            <div
              key={idx}
              className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 ${c.borderClass}`}
            >
              <Icon className={`h-5 w-5 ${c.color}`} />
              <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{c.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{c.body}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
