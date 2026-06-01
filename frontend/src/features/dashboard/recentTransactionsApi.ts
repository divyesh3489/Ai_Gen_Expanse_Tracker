import { http } from '../../app/api/http'
import type { DashboardTransaction } from './dashboardTypes'

export type RecentTransactionRow = {
  id: number
  name: string
  category: string
  category_color?: string | null
  date: string
  icon?: string | null
  amount: number | string
  type: 'expense' | 'income'
}

function mapRow(row: RecentTransactionRow): DashboardTransaction {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    category_color: row.category_color,
    date: row.date,
    icon: row.icon ?? undefined,
    amount: Number(row.amount) || 0,
    type: row.type,
  }
}

/** Latest expenses and incomes merged by the backend (no date filter). */
export async function fetchRecentTransactions(): Promise<DashboardTransaction[]> {
  const res = await http.get<RecentTransactionRow[]>(
    '/v1/expanse/reports/dashboard/recent-transactions/',
  )
  const rows = Array.isArray(res.data) ? res.data : []
  return rows
    .map(mapRow)
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateDiff !== 0) return dateDiff
      return b.id - a.id
    })
    .slice(0, 5)
}
