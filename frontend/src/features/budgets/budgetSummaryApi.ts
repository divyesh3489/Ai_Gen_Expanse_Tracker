import { http } from '../../app/api/http'
import type { BudgetSummaryRow } from '../dashboard/dashboardTypes'

export async function fetchBudgetSummary(from: string, to: string): Promise<BudgetSummaryRow[]> {
  const res = await http.get<BudgetSummaryRow[]>('/v1/expanse/budgets/summary/', {
    params: { from, to },
  })
  return Array.isArray(res.data) ? res.data : []
}
