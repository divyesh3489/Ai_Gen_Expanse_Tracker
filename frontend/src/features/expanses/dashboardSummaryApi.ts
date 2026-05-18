import { http } from '../../app/api/http'

/** Matches backend: comparison fields are null when the selected range is not the current calendar month. */
export type DashboardSummary = {
  total_monthly_spend: number | string
  total_monthly_income: number | string
  total_last_month_spend: number | string | null
  total_last_month_income: number | string | null
  last_month_spend_change_percent: number | string | null
  last_month_income_change_percent: number | string | null
  net_monthly: number | string
  net_last_month: number | string | null
  last_month_net_change_percent: number | string | null
  saving_rate_percent: number | string
  /** Prior calendar month's savings rate (%), when in current month window; used for MoM delta. */
  last_month_saving_rate_percent?: number | string | null
}

export async function fetchDashboardSummary(params: { from: string; to: string }): Promise<DashboardSummary> {
  const res = await http.get<DashboardSummary>('/v1/expanse/reports/summary/', {
    params: { from: params.from, to: params.to },
  })
  return res.data
}
