import { http } from '../../app/api/http'
import type { FinanceTrendRow } from './dashboardTypes'

export async function fetchFinanceTrend(year: number): Promise<FinanceTrendRow[]> {
  const res = await http.get<FinanceTrendRow[]>('/v1/expanse/reports/dashboard/finance-trend/', {
    params: { year },
  })
  return Array.isArray(res.data) ? res.data : []
}
