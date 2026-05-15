import type { DashboardSummary } from '../expanses/dashboardSummaryApi'

function num(v: number | string | null | undefined): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** MoM savings rate change (%); null when prior rate is unknown. */
export function savingRateMoMPercent(summary: DashboardSummary): number | null {
  const currRate = num(summary.saving_rate_percent)
  const prevFromApi = summary.last_month_saving_rate_percent
  if (prevFromApi != null) {
    const prevRate = num(prevFromApi)
    if (!Number.isFinite(currRate) || !Number.isFinite(prevRate)) return null
    if (prevRate === 0 && currRate === 0) return 0
    if (prevRate === 0) return currRate > 0 ? 100 : 0
    return ((currRate - prevRate) / Math.abs(prevRate)) * 100
  }
  if (summary.total_last_month_income == null || summary.net_last_month == null) return null
  const prevIncome = num(summary.total_last_month_income)
  const prevNet = num(summary.net_last_month)
  const prevRate = prevIncome !== 0 ? (prevNet / prevIncome) * 100 : 0
  if (prevIncome === 0 && num(summary.total_monthly_income) === 0) return null
  if (prevRate === 0 && currRate === 0) return 0
  if (prevRate === 0) return currRate > 0 ? 100 : 0
  return ((currRate - prevRate) / Math.abs(prevRate)) * 100
}
