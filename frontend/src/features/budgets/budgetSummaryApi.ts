import { http } from '../../app/api/http'
import type { BudgetSummaryRow } from '../dashboard/dashboardTypes'

/** Normalize API payload (supports legacy field names from older backend). */
function normalizeBudgetSummaryRow(raw: Record<string, unknown>): BudgetSummaryRow {
  const budgetAmount = raw.budget_amount ?? raw.amount
  const spentAmount = raw.spent_amount ?? raw.total_spend
  const progress = raw.progress_percent ?? raw.percent_used
  const categoryName =
    typeof raw.category_name === 'string'
      ? raw.category_name
      : typeof raw.category === 'string'
        ? raw.category
        : null

  return {
    id: Number(raw.id),
    category: typeof raw.category === 'number' ? raw.category : null,
    category_name: categoryName,
    budget_amount: budgetAmount as number | string,
    spent_amount: spentAmount as number | string,
    remaining_amount: (raw.remaining_amount ?? 0) as number | string,
    progress_percent: progress as number | string | null,
    is_over_budget: Boolean(raw.is_over_budget ?? (Number(spentAmount) > Number(budgetAmount))),
  }
}

export async function fetchBudgetSummary(from: string, to: string): Promise<BudgetSummaryRow[]> {
  const res = await http.get<Record<string, unknown>[]>('/v1/expanse/budgets/summary/', {
    params: { from, to },
  })
  if (!Array.isArray(res.data)) return []
  return res.data.map((row) => normalizeBudgetSummaryRow(row))
}
