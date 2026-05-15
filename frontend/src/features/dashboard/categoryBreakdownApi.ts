import { http } from '../../app/api/http'
import { colorForCategory } from './categoryColors'
import type { ExpenseCategorySlice } from './dashboardTypes'

export type CategoryBreakdownRow = {
  category__name?: string | null
  category?: string | null
  total: number | string
  percentage?: number | string
  percent?: number | string
}

function num(v: number | string | null | undefined): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function mapRows(rows: CategoryBreakdownRow[]): ExpenseCategorySlice[] {
  return rows
    .map((row, i) => {
      const category = (row.category__name ?? row.category ?? 'Uncategorized') || 'Uncategorized'
      const amount = num(row.total)
      const percent = num(row.percentage ?? row.percent)
      return {
        category,
        amount,
        percent,
        color: colorForCategory(category, i),
      }
    })
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount)
}

/** Category breakdown for the dashboard summary period (`from` / `to` = YYYY-MM-DD). */
export async function fetchCategoryBreakdownByRange(
  from: string,
  to: string,
): Promise<ExpenseCategorySlice[]> {
  const res = await http.get<CategoryBreakdownRow[]>(
    '/v1/expanse/reports/dashboard/category-breakdown/',
    { params: { from, to } },
  )
  const rows = Array.isArray(res.data) ? res.data : []
  return mapRows(rows)
}
